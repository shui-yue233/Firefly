#!/usr/bin/env node
/**
 * 一键发布：Obsidian 笔记 → 本地博客源文件 → 提交 → 推送 → Vercel 自动部署
 *
 *   1. 检查工作区是否干净，避免把不该提交的改动一起带上线
 *   2. 运行 sync-obsidian.mjs 把笔记同步进 src/content/posts
 *   3. 逐文件列出将要提交的内容，等你确认
 *   4. git add / commit / push
 *
 * 用法：
 *   pnpm ship                正常走流程（会停下来问你确认）
 *   pnpm ship --yes          跳过确认，全自动
 *   pnpm ship --dry-run      只演一遍，不提交不推送
 *   pnpm ship --no-sync      跳过同步，只提交推送
 *   pnpm ship -m "文案"       自定义提交信息
 *
 * 注意：命令名叫 ship 而不是 publish，因为 pnpm publish 是 pnpm 发布 npm 包的内置命令，
 * 会去 registry.npmjs.org 上传包并报 404，轮不到我们的脚本。
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SYNC_SCRIPT = path.join(__dirname, "sync-obsidian.mjs");

const args = process.argv.slice(2);
const has = (...flags) => flags.some((f) => args.includes(f));
const DRY_RUN = has("--dry-run", "-n");
// 干跑只是为了预览，不该在确认环节停下来等人输入。
const ASSUME_YES = has("--yes", "-y") || DRY_RUN;
const SKIP_SYNC = has("--no-sync");

const mi = args.findIndex((a) => a === "-m" || a === "--message");
const CUSTOM_MESSAGE = mi >= 0 ? args[mi + 1] : undefined;

const c = {
	reset: "\u001b[0m",
	dim: "\u001b[2m",
	bold: "\u001b[1m",
	red: "\u001b[31m",
	green: "\u001b[32m",
	yellow: "\u001b[33m",
	cyan: "\u001b[36m",
};
const paint = (color, s) => `${color}${s}${c.reset}`;
const step = (n, s) => console.log(`\n${paint(c.cyan, `[${n}/5]`)} ${paint(c.bold, s)}`);
const info = (s) => console.log(`      ${s}`);
const die = (msg, hint) => {
	console.error(`\n${paint(c.red, "✗ " + msg)}`);
	if (hint) console.error(`  ${paint(c.dim, hint)}`);
	process.exit(1);
};

/** 跑一条 git 命令，返回 stdout 字符串；失败时抛出带 stderr 的错误。 */
function git(...gitArgs) {
	try {
		return execFileSync("git", gitArgs, {
			cwd: ROOT,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
	} catch (err) {
		const stderr = (err.stderr || "").toString().trim();
		const stdout = (err.stdout || "").toString().trim();
		throw new Error([stderr, stdout, err.message].filter(Boolean).join("\n"));
	}
}

function gitSafe(...gitArgs) {
	try {
		return { ok: true, out: git(...gitArgs) };
	} catch (err) {
		return { ok: false, out: err.message };
	}
}

async function confirm(question) {
	if (ASSUME_YES) {
		info(paint(c.dim, `(${question} → 已用 --yes 自动回答 y)`));
		return true;
	}
	if (!process.stdin.isTTY) {
		die("当前不是交互式终端，无法询问确认。", "请加 --yes 全自动执行，或 --dry-run 只看不改。");
	}
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	try {
		const answer = await new Promise((resolve) => rl.question(`${question} [y/N] `, resolve));
		return /^y(es)?$/i.test(answer.trim());
	} finally {
		rl.close();
	}
}

console.log(paint(c.bold, "\n══ Obsidian → 博客 一键发布 ══"));
if (DRY_RUN) console.log(paint(c.yellow, "  干跑模式：不会提交、不会推送。\n"));

// ── 0. 前置检查 ────────────────────────────────────────────────
step(1, "检查环境");

const gitDir = gitSafe("rev-parse", "--show-toplevel");
if (!gitDir.ok || !gitDir.out.includes("Firefly")) {
	die("这里不是 Firefly 的 git 仓库。", `当前目录：${ROOT}`);
}
info(`仓库：${gitDir.out}`);

const branch = git("rev-parse", "--abbrev-ref", "HEAD");
info(`分支：${branch}`);

const remote = gitSafe("remote", "get-url", "origin");
if (!remote.ok) die("没有配置名为 origin 的远程仓库，无法推送。");
info(`远程：${remote.out}`);

// 有冲突的 rebase/merge 残留时，绝不能继续。
const rebaseDir = path.join(ROOT, ".git", "rebase-merge");
const rebaseApply = path.join(ROOT, ".git", "rebase-apply");
if (existsSync(rebaseDir) || existsSync(rebaseApply)) {
	die("仓库正处于未完成的 rebase 中途。", "先跑 git rebase --abort 或 git rebase --continue 处理掉。");
}

// 工作区脏会让 commit 把无关改动一起带上线，先拦下来让用户决定。
git("add", "-A", "--", ":!**/.obsidian-sync.json");
const preExisting = git("status", "--porcelain")
	.split("\n")
	.filter(Boolean)
	.filter((line) => !/\|\s*$/.test(line));

if (preExisting.length > 0) {
	console.log(
		paint(
			c.yellow,
			`\n      ⚠ 工作区里已有 ${preExisting.length} 项未提交的改动（不在本次同步范围内）：`,
		),
	);
	for (const line of preExisting.slice(0, 15)) info(paint(c.dim, line));
	if (preExisting.length > 15) info(paint(c.dim, `… 另外还有 ${preExisting.length - 15} 项`));
	console.log("");
	const go = await confirm("这些改动会一并提交上线，继续吗？");
	if (!go) {
		console.log(paint(c.yellow, "\n已取消。工作区未做任何改动。\n"));
		process.exit(0);
	}
} else {
	info(paint(c.green, "工作区干净"));
}

// ── 1. 同步 ───────────────────────────────────────────────────
let syncSummary = [];
if (SKIP_SYNC) {
	step(2, "同步 Obsidian 笔记");
	info(paint(c.dim, "已用 --no-sync 跳过"));
} else {
	step(2, "同步 Obsidian 笔记");
	if (!existsSync(SYNC_SCRIPT)) die(`找不到同步脚本：${SYNC_SCRIPT}`);
	try {
		const out = execFileSync(process.execPath, [SYNC_SCRIPT], {
			cwd: ROOT,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
		syncSummary = out
			.split("\n")
			.filter((l) => /✓|完成|⚠/.test(l))
			.map((l) => l.trim());
		for (const l of syncSummary) info(l);
		if (syncSummary.length === 0) info(paint(c.dim, "没有变化"));
	} catch (err) {
		const out = ((err.stdout || "") + (err.stderr || "")).toString().trim();
		die("同步失败，已中止，没有提交任何东西。\n" + out);
	}
}

// ── 2. 采集将要提交的内容 ─────────────────────────────────────
step(3, "整理本次改动");
git("add", "-A", "--", ":!**/.obsidian-sync.json");

const staged = git("diff", "--cached", "--name-status").split("\n").filter(Boolean);
if (staged.length === 0) {
	console.log(paint(c.green, "\n✓ 没有需要提交的改动，线上已经是最新。\n"));
	process.exit(0);
}

const posts = staged.filter((l) => l.includes("src/content/posts/"));
const others = staged.filter((l) => !l.includes("src/content/posts/"));
const label = { A: "新增", M: "修改", D: "删除", R: "改名" };

if (posts.length) {
	console.log(paint(c.bold, `\n      文章 ${posts.length} 项：`));
	for (const line of posts) {
		const [code, ...rest] = line.split("\t");
		console.log(`        ${paint(c.green, label[code[0]] ?? code)} ${rest.join(" → ")}`);
	}
} else {
	console.log(paint(c.dim, "\n      本次没有文章变化"));
}
if (others.length) {
	console.log(paint(c.bold, `\n      其他文件 ${others.length} 项：`));
	for (const line of others) {
		const [code, ...rest] = line.split("\t");
		console.log(`        ${paint(c.dim, label[code[0]] ?? code)} ${rest.join(" → ")}`);
	}
}

// ── 3. 提交信息 ───────────────────────────────────────────────
const stamp = new Date().toLocaleString("zh-CN", { hour12: false });
const defaultMessage = posts.length
	? `sync: 同步 Obsidian 笔记（${posts.length} 项，${stamp}）`
	: `chore: 更新站点配置（${stamp}）`;
const message = CUSTOM_MESSAGE || defaultMessage;

console.log(`\n      提交信息：${paint(c.bold, message)}`);

if (DRY_RUN) {
	console.log(paint(c.yellow, "\n干跑结束：未提交、未推送。真实执行时上面这些就会上线。\n"));
	process.exit(0);
}

const go = await confirm("\n提交并推送到 GitHub（会触发 Vercel 部署）吗？");
if (!go) {
	console.log(
		paint(c.yellow, "\n已取消。注意：改动已 git add 进暂存区，同步产生的文件仍在工作区里。\n"),
	);
	process.exit(0);
}

// ── 4. 提交 ───────────────────────────────────────────────────
step(4, "提交");
try {
	git("commit", "-q", "-m", message);
} catch (err) {
	die("提交失败。", err.message);
}
info(git("log", "--oneline", "-1"));

// ── 5. 推送 ───────────────────────────────────────────────────
step(5, "推送到 GitHub");
const push = gitSafe("push", "origin", `HEAD:${branch}`);
if (!push.ok) {
	const out = push.out;
	console.error(paint(c.red, "\n✗ 推送失败。"));
	console.error(out);
	if (/could not resolve host|unable to access|timed out|Connection was reset/i.test(out)) {
		console.error(
			paint(
				c.yellow,
				"\n  看着是网络问题（连不上 github.com）。\n" +
					"  你的提交已经在本地安全保存了，网络恢复后单独跑一句就能补推：\n" +
					"      git push origin " +
					branch,
			),
		);
	}
	process.exit(1);
}

const ahead = gitSafe("rev-list", "--count", `origin/${branch}..HEAD`);
if (ahead.ok && ahead.out === "0") {
	console.log(paint(c.green, `\n✓ 已推送，GitHub 上已是最新。`));
} else {
	console.log(paint(c.green, `\n✓ 推送完成。`));
}
console.log(
	paint(
		c.bold,
		"\nVercel 会在 1–3 分钟内自动重新部署。\n" +
			"查看进度：https://vercel.com/dashboard\n" +
			"部署完成后刷新：https://firefly-lemon-seven.vercel.app/\n",
	),
);
