#!/usr/bin/env node
/**
 * Obsidian → Firefly 同步脚本
 *
 * 做的事：扫描 Obsidian 库 → 按规则筛选要发布的笔记 → 把 Obsidian 专有语法
 * 转成标准 Markdown → 拷贝被引用的图片 → 写入 Firefly 的 src/content/posts/
 *
 * 用法：
 *   node scripts/sync-obsidian.mjs            # 正式同步
 *   node scripts/sync-obsidian.mjs --dry-run  # 只预览，不写任何文件
 *   node scripts/sync-obsidian.mjs --verbose  # 打印每篇笔记的处理详情
 *
 * 安全性：只读取 Obsidian 库，绝不修改库里的任何文件。
 * 写入范围限于 Firefly/src/content/posts/ 与 manifest 记录的文件。
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// 配置文件放在仓库外层（Desktop/blog/blog-sync.config.mjs），
// 这样 Git 不会把它当成主题源码的一部分。脚本内若没有则回退到 Firefly 根目录。
// 可用 --config <路径> 或环境变量 BLOG_SYNC_CONFIG 指定别的配置文件。
const rawArgs = process.argv.slice(2);
let CONFIG_PATH = null;
const configFlagIdx = rawArgs.findIndex((a) => a === "--config" || a.startsWith("--config="));
if (configFlagIdx !== -1) {
	const a = rawArgs[configFlagIdx];
	CONFIG_PATH = a.includes("=") ? a.slice(a.indexOf("=") + 1) : rawArgs[configFlagIdx + 1];
	if (!CONFIG_PATH) {
		console.error("--config 后面需要跟配置文件路径");
		process.exit(1);
	}
	CONFIG_PATH = path.resolve(CONFIG_PATH);
} else if (process.env.BLOG_SYNC_CONFIG) {
	CONFIG_PATH = path.resolve(process.env.BLOG_SYNC_CONFIG);
}
if (!CONFIG_PATH) {
	const candidates = [
		path.resolve(PROJECT_ROOT, "..", "blog-sync.config.mjs"),
		path.join(PROJECT_ROOT, "blog-sync.config.mjs"),
	];
	CONFIG_PATH = candidates.find((p) => fs.existsSync(p));
	if (!CONFIG_PATH) {
		console.error(`找不到配置文件 blog-sync.config.mjs，已尝试：\n  ${candidates.join("\n  ")}`);
		process.exit(1);
	}
}
if (!fs.existsSync(CONFIG_PATH)) {
	console.error(`[错误] 配置文件不存在：${CONFIG_PATH}`);
	process.exit(1);
}
// Windows 下 import() 只接受 file:// URL，必须转换
const cfg = await import(pathToFileURL(CONFIG_PATH).href);

const ARGS = new Set(rawArgs);
const DRY_RUN = ARGS.has("--dry-run");
const VERBOSE = ARGS.has("--verbose");

const VAULT = path.resolve(cfg.VAULT);
// cfg.FIREFLY 是相对「配置文件所在目录」解析的（配置文件在 Firefly 外层）
const CONFIG_DIR = path.dirname(CONFIG_PATH);
const FIREFLY_DIR = path.resolve(CONFIG_DIR, cfg.FIREFLY);
const POSTS_DIR = path.join(FIREFLY_DIR, "src", "content", "posts");
const MANIFEST_PATH = path.join(FIREFLY_DIR, cfg.MANIFEST_NAME);

/* ------------------------------------------------------------------ *
 * 小工具
 * ------------------------------------------------------------------ */

const log = (...a) => console.log(...a);
const vlog = (...a) => {
	if (VERBOSE) console.log(...a);
};

/** 统一的相对路径显示（用 / 分隔，便于阅读） */
const rel = (p) => path.relative(VAULT, p).split(path.sep).join("/");

/** 短哈希，用于避免图片重名冲突 */
const shortHash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 8);

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFileSafe(file, content) {
	ensureDir(path.dirname(file));
	fs.writeFileSync(file, content, "utf8");
}

/** 退出前给出明确错误，避免静默失败 */
function fail(msg) {
	console.error(`\n[错误] ${msg}\n`);
	process.exit(1);
}

/* ------------------------------------------------------------------ *
 * 第一步：扫描库
 * ------------------------------------------------------------------ */

function isExcluded(relPath) {
	const segments = relPath.split("/");
	// 目录级排除
	for (const seg of segments.slice(0, -1)) {
		if (cfg.EXCLUDE_DIRS.includes(seg)) return true;
	}
	// 文件级排除
	const base = segments[segments.length - 1];
	if (cfg.EXCLUDE_FILES.includes(base)) return true;
	// 任何隐藏文件/目录（以 . 开头）都跳过
	if (segments.some((s) => s.startsWith("."))) return true;
	return false;
}

function walk(dir, out = []) {
	let entries;
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return out;
	}
	for (const e of entries) {
		const full = path.join(dir, e.name);
		const r = rel(full);
		if (isExcluded(r)) continue;
		if (e.isDirectory()) {
			walk(full, out);
		} else if (e.isFile() && /\.md$/i.test(e.name)) {
			out.push(full);
		}
	}
	return out;
}

/* ------------------------------------------------------------------ *
 * 第二步：frontmatter 解析（自己实现，避免额外依赖）
 * ------------------------------------------------------------------ */

/**
 * 极简 YAML frontmatter 解析器，只支持本库实际用到的写法：
 *   key: value
 *   key: [a, b]
 *   key:
 *     - a
 *     - b
 *   key: "quoted" / 'quoted'
 * 遇到嵌套对象（如 Obsidian 的某些元数据）直接当字符串处理。
 */
function splitFrontmatter(raw) {
	const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
	if (!m) return { data: {}, body: raw, hadFrontmatter: false };
	return { data: parseYamlLite(m[1]), body: raw.slice(m[0].length), hadFrontmatter: true };
}

function unquote(s) {
	const t = s.trim();
	if (
		(t.startsWith('"') && t.endsWith('"') && t.length >= 2) ||
		(t.startsWith("'") && t.endsWith("'") && t.length >= 2)
	) {
		return t.slice(1, -1);
	}
	return t;
}

function parseYamlLite(text) {
	const data = {};
	const lines = text.split(/\r?\n/);
	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim() || /^\s*#/.test(line)) {
			i++;
			continue;
		}
		const kv = /^([A-Za-z0-9_\u4e00-\u9fa5-]+)\s*:\s*(.*)$/.exec(line);
		if (!kv) {
			i++;
			continue;
		}
		const key = kv[1];
		let value = kv[2];

		// 块状数组：key:\n  - a\n  - b
		if (value.trim() === "") {
			const items = [];
			let j = i + 1;
			while (j < lines.length && /^\s*-\s+/.test(lines[j])) {
				items.push(unquote(lines[j].replace(/^\s*-\s+/, "")));
				j++;
			}
			if (items.length) {
				data[key] = items;
				i = j;
				continue;
			}
			data[key] = "";
			i++;
			continue;
		}

		// 行内数组：[a, b, c]
		if (/^\[.*\]$/.test(value.trim())) {
			const inner = value.trim().slice(1, -1).trim();
			data[key] = inner
				? inner.split(",").map((s) => unquote(s)).filter(Boolean)
				: [];
			i++;
			continue;
		}

		data[key] = unquote(value);
		i++;
	}
	return data;
}

/* ------------------------------------------------------------------ *
 * 第三步：发布判定
 * ------------------------------------------------------------------ */

function isPublished(data, relPath) {
	// 显式排除优先
	if (data.draft === true || data.draft === "true") return false;
	if (data.published === false || data.published === "false") return false;

	if (cfg.PUBLISH_MODE === "folder") {
		// 只看目录：在 PUBLISH_FOLDERS 下的全部发布，其余一律不发布
		const top = relPath.split("/")[0];
		return cfg.PUBLISH_FOLDERS.includes(top);
	}

	if (cfg.PUBLISH_MODE === "all") return true;

	// frontmatter 模式：必须显式标记才发布
	for (const key of cfg.PUBLISH_KEYS) {
		const v = data[key];
		if (v === true || v === "true" || v === "yes" || v === "是") return true;
	}
	return false;
}

/* ------------------------------------------------------------------ *
 * 第四步：日期归一化
 * ------------------------------------------------------------------ */

function parseDate(value, fallbackFile) {
	const iso = /^(\d{4})-(\d{2})-(\d{2})/;
	const dotted = /^(\d{4})[.\/年](\d{1,2})[.\/月](\d{1,2})/;

	const tryStr = (s) => {
		const t = String(s).trim();
		let m = iso.exec(t);
		if (m) return `${m[1]}-${m[2]}-${m[3]}`;
		m = dotted.exec(t);
		if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
		return null;
	};

	if (value) {
		const r = tryStr(value);
		if (r) return r;
	}
	// 退化到文件修改时间
	try {
		const st = fs.statSync(fallbackFile);
		return st.mtime.toISOString().slice(0, 10);
	} catch {
		return new Date().toISOString().slice(0, 10);
	}
}

/* ------------------------------------------------------------------ *
 * 第五步：图片索引
 * ------------------------------------------------------------------ */

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i;

function buildAssetIndex() {
	const byName = new Map(); // 文件名 → 绝对路径[]（同名可能多处）
	const byRel = new Map(); // 相对路径 → 绝对路径
	const stack = [VAULT];
	while (stack.length) {
		const dir = stack.pop();
		let entries;
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const e of entries) {
			const full = path.join(dir, e.name);
			const r = rel(full);
			if (isExcluded(r)) continue;
			if (e.isDirectory()) stack.push(full);
			else if (e.isFile() && IMAGE_EXT.test(e.name)) {
				const k = e.name;
				if (!byName.has(k)) byName.set(k, []);
				byName.get(k).push(full);
				byRel.set(r, full);
			}
		}
	}
	return { byName, byRel };
}

/**
 * 解析 Obsidian 的资源引用。
 * Obsidian 是"最短唯一路径"匹配：![[image.png]] 和 ![[folder/image.png]] 都合法。
 */
function resolveAsset(target, noteDir, assetIndex) {
	const clean = target.split("|")[0].split("#")[0].trim();
	if (!clean) return null;

	// 1) 相对本笔记目录
	const localRel = path
		.relative(VAULT, path.resolve(noteDir, clean))
		.split(path.sep)
		.join("/");
	if (assetIndex.byRel.has(localRel)) return assetIndex.byRel.get(localRel);

	// 2) 全库按相对路径精确匹配
	if (assetIndex.byRel.has(clean)) return assetIndex.byRel.get(clean);

	// 3) 按文件名匹配（取第一个）
	const base = path.basename(clean);
	if (assetIndex.byName.has(base)) return assetIndex.byName.get(base)[0];

	return null;
}

/* ------------------------------------------------------------------ *
 * 第六步：Obsidian → 标准 Markdown 转换
 * ------------------------------------------------------------------ */

/**
 * 把正文拆成「可转换区」和「保护区」（围栏代码块 / 行内代码）。
 * 只对可转换区做正则替换，避免把代码里的 [[ ]] 或 ![[ ]] 改坏。
 */
function withProtectedRegions(body, transform) {
	const stash = [];
	const PARK = (s) => {
		stash.push(s);
		return `\u0000P${stash.length - 1}\u0000`;
	};

	let text = body;

	// 围栏代码块 ``` 或 ~~~
	text = text.replace(/(^|\n)(`{3,}|~{3,})[\s\S]*?\n\2[^\n]*/g, (m) => PARK(m));
	// 行内代码 `...`
	text = text.replace(/`[^`\n]+`/g, (m) => PARK(m));

	let out = transform(text);

	out = out.replace(/\u0000P(\d+)\u0000/g, (_, i) => stash[Number(i)]);
	return out;
}

/** %% 注释 %% 直接删除（Obsidian 语义就是"不渲染"） */
function stripComments(text) {
	let out = text;
	// 多行 %%...%%（非贪婪）
	out = out.replace(/%%[\s\S]*?%%/g, "");
	// 落单的 %% 开头的行也去掉
	out = out
		.split(/\r?\n/)
		.filter((l) => !/^\s*%%/.test(l))
		.join("\n");
	return out;
}

/**
 * Firefly 装了 rehype-callouts，原生就能渲染 Obsidian 的 `> [!note]` 语法，
 * 所以这里**不做转换**，原样把 callout 交给 Markdown 流水线，
 * 这样标题、可折叠 `[!tip]-`、图标主题都保持官方效果。
 *
 * （早期版本会把 callout 摊平成一堆 `> **📘 标题**`，反而丢掉了折叠和主题样式。）
 */
function convertCallouts(text) {
	return text;
}

/**
 * ![[图片]] / ![[图片|尺寸]] → 标准 Markdown 图片
 * 同时把资源拷贝到 posts 目录下，返回改写后的文本和用到的资源集合。
 */
function convertEmbeds(text, noteDir, assetIndex, usedAssets) {
	return text.replace(/!\[\[([^\]]+)\]\]/g, (whole, inner) => {
		const target = inner.split("|")[0].trim();
		if (!target) return whole;

		// 非图片嵌入（如 ![[某笔记]]）→ 保留给 convertWikiLinks 处理
		if (!IMAGE_EXT.test(target)) {
			return whole;
		}

		const src = resolveAsset(target, noteDir, assetIndex);
		if (!src) {
			vlog(`    ! 找不到图片: ${target}`);
			return `**（缺失图片：${target}）**`;
		}

		const base = path.basename(src);
		// 用短哈希前缀避免同名不同图互相覆盖
		const safeName = `${shortHash(rel(src))}-${base}`;
		usedAssets.set(rel(src), { src, name: safeName });

		const alt = path.basename(base, path.extname(base));
		return `![${alt}](./images/${safeName})`;
	});
}

/**
 * 顺手处理「本来就是标准 Markdown」的相对图片引用：![alt](相对路径.png)
 * Obsidian 里两种写法都可能出现，只处理非 http(s)/绝对路径 的本地图片；
 * 找不到对应文件时原样保留，不动用户的文本。
 */
function convertMdImages(text, noteDir, assetIndex, usedAssets) {
	return text.replace(/(!\[[^\]]*\]\()([^)\s]+)(\s+"[^"]*")?(\))/g, (whole, open, href, title, close) => {
		if (/^(https?:|data:|mailto:|#|\/)/i.test(href)) return whole;
		if (!IMAGE_EXT.test(href.split("#")[0].split("?")[0])) return whole;

		const clean = decodeURIComponent(href.split("#")[0].split("?")[0]);
		const src = resolveAsset(clean, noteDir, assetIndex);
		if (!src) {
			vlog(`    ! 找不到本地图片: ${href}`);
			return whole;
		}

		const base = path.basename(src);
		const safeName = `${shortHash(rel(src))}-${base}`;
		usedAssets.set(rel(src), { src, name: safeName });
		return `${open}./images/${safeName}${title ?? ""}${close}`;
	});
}

/**
 * [[笔记]] / [[笔记|别名]] / [[笔记#标题]] → 站内链接或纯文本
 */
function convertWikiLinks(text, linkMap) {
	return text.replace(/(?<!!)\[\[([^\]]+)\]\]/g, (whole, inner) => {
		const [rawTarget, rawAlias] = inner.split("|");
		const target = rawTarget.split("#")[0].trim();
		const anchor = rawTarget.includes("#") ? rawTarget.split("#").slice(1).join("#").trim() : "";
		if (!target) return whole;

		const pretty = (rawAlias ?? path.basename(target)).trim();
		const hit = linkMap.get(target.toLowerCase()) ?? linkMap.get(path.basename(target).toLowerCase());

		if (hit) {
			const hash = anchor ? `#${anchor}` : "";
			return `[${pretty}](/posts/${encodeURIComponent(hit.slug)}/${hash})`;
		}
		// 未发布/不存在的笔记：不产生死链，保留可读文本并标注来源。
		// 注意：这里不能用裸 HTML——Astro 默认没有 rehype-raw，<span> 会被原样输出成可见标签。
		return `*${pretty}（Obsidian 内链：${target}）*`;
	});
}

/** 文字里的 #标签 → 去掉井号，避免和 Markdown 标题冲突 */
function normaliseInlineTags(text) {
	return text.replace(/(^|[\s(（])#([\p{Script=Han}A-Za-z0-9_\-/]+)/gu, (whole, pre, tag) => {
		// 排除 URL 锚点、十六进制颜色等
		if (/^[0-9a-fA-F]{3,8}$/.test(tag)) return whole;
		if (!/[\p{Script=Han}A-Za-z_\/]/u.test(tag)) return whole;
		return `${pre}\`#${tag}\``;
	});
}

/** C / C++ / C# 预处理器指令之类，看着像标签但其实是代码 */
const TAG_SKIP = new Set([
	"include", "define", "ifdef", "ifndef", "endif", "pragma", "undef", "elif",
	"region", "endregion", "nullable", "error", "warning", "line", "import",
]);

/**
 * 从正文里把 Obsidian 行内标签 `#二分/二分查找` 收集成数组。
 * 只在「非代码块」里找，并跳过 #include 这类代码指令，避免误伤。
 */
function extractInlineTags(text) {
	const tags = new Set();
	// 先把围栏代码块和行内代码挖掉，剩下的才是正文
	const prose = text
		.replace(/```[\s\S]*?```/g, "")
		.replace(/~~~[\s\S]*?~~~/g, "")
		.replace(/`[^`\n]*`/g, "");

	for (const m of prose.matchAll(/(^|[\s(（])#([\p{Script=Han}A-Za-z0-9_\-/]+)/gu)) {
		const tag = m[2];
		if (/^[0-9a-fA-F]{3,8}$/.test(tag)) continue; // 十六进制颜色 / 锚点
		if (!/[\p{Script=Han}A-Za-z_\/]/u.test(tag)) continue;
		if (TAG_SKIP.has(tag.toLowerCase())) continue;
		tags.add(tag);
	}
	return [...tags];
}

/* ------------------------------------------------------------------ *
 * 第七步：主流程
 * ------------------------------------------------------------------ */

function slugify(name) {
	return (
		name
			.trim()
			.replace(/\.md$/i, "")
			// 去掉 Windows 文件名非法字符
			.replace(/[\\/:*?"<>|]/g, "-")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "") || "untitled"
	);
}

function normaliseTags(raw) {
	let list = [];
	if (Array.isArray(raw)) list = raw;
	else if (typeof raw === "string" && raw.trim()) {
		list = raw
			.replace(/^\[|\]$/g, "")
			.split(/[,\s]+/)
			.map((s) => s.trim())
			.filter(Boolean);
	}
	return [
		...new Set(
			list
				.map((t) => String(t).replace(/^#/, "").trim())
				.filter(Boolean)
				.map((t) => (cfg.TAG_PREFIX ? `${cfg.TAG_PREFIX}${t}` : t)),
		),
	];
}

async function main() {
	log("─".repeat(64));
	log("Obsidian → Firefly 同步");
	log("─".repeat(64));

	if (!fs.existsSync(VAULT)) fail(`找不到 Obsidian 库：${VAULT}`);
	if (!fs.existsSync(FIREFLY_DIR)) fail(`找不到 Firefly 项目：${FIREFLY_DIR}`);

	log(`库目录   : ${VAULT}`);
	log(`Firefly  : ${FIREFLY_DIR}`);
	log(`发布模式 : ${cfg.PUBLISH_MODE}`);
	if (DRY_RUN) log("模式     : 干跑（不会写任何文件）");
	log("");

	// ---- 扫描 ----
	const allNotes = walk(VAULT);
	log(`扫描到 ${allNotes.length} 个 Markdown 文件（已排除工具目录）`);

	// ---- 解析 + 筛选 ----
	const candidates = [];
	for (const file of allNotes) {
		let raw;
		try {
			raw = fs.readFileSync(file, "utf8");
		} catch (e) {
			vlog(`  ! 读取失败 ${rel(file)}: ${e.message}`);
			continue;
		}
		const { data, body } = splitFrontmatter(raw);
		const relPath = rel(file);
		if (!isPublished(data, relPath)) {
			vlog(`  · 跳过（未标记发布）: ${relPath}`);
			continue;
		}
		candidates.push({ file, relPath, data, body });
	}

	if (candidates.length === 0) {
		log("\n没有找到任何标记发布的笔记。");
		log(`提示：在 Obsidian 笔记的 frontmatter 里加上 publish: true 就会发布。`);
		log(`      例如：\n---\ntitle: 我的笔记\npublish: true\n---`);
		process.exit(0);
	}

	// ---- 分配 slug ----
	const usedSlugs = new Map();
	const notes = candidates.map((c) => {
		const baseName = path.basename(c.file, ".md");
		let slug = slugify(baseName);
		if (usedSlugs.has(slug)) {
			const n = usedSlugs.get(slug) + 1;
			usedSlugs.set(slug, n);
			slug = `${slug}-${n}`;
		} else {
			usedSlugs.set(slug, 0);
		}
		return { ...c, slug, noteDir: path.dirname(c.file) };
	});

	// ---- 建立链接映射 ----
	const linkMap = new Map();
	for (const n of notes) {
		const base = path.basename(n.file, ".md").toLowerCase();
		const relNoExt = n.relPath.replace(/\.md$/i, "").toLowerCase();
		if (!linkMap.has(base)) linkMap.set(base, n);
		if (!linkMap.has(relNoExt)) linkMap.set(relNoExt, n);
	}

	// ---- 构建图片索引 ----
	const assetIndex = buildAssetIndex();

	// ---- 逐篇转换 ----
	log(`\n将发布 ${notes.length} 篇：`);
	const outputs = [];
	const allAssets = new Map();

	for (const n of notes) {
		const usedAssets = new Map();

		let body = n.body;

		// 转换顺序有讲究：先删注释，再处理嵌入和链接
		// 行内标签先收集（自己会跳过代码块），它们会成为 frontmatter 的 tags
		const inlineTags = extractInlineTags(body);

		body = withProtectedRegions(body, (t) => {
			let s = stripComments(t);
			s = convertCallouts(s);
			// 顺序很重要：标准语法的图片先处理，再处理 ![[嵌入]]。
			// 反过来的话，convertMdImages 会二次解析刚改写出的 `./images/xxx.png`
			// 并误报“找不到本地图片”。
			s = convertMdImages(s, n.noteDir, assetIndex, usedAssets);
			s = convertEmbeds(s, n.noteDir, assetIndex, usedAssets);
			s = convertWikiLinks(s, linkMap);
			s = normaliseInlineTags(s);
			return s;
		});

		// 规范化首尾与空行：删注释/嵌图后容易留下多余空行，压成最多一个空行
		body = body
			.replace(/\r\n/g, "\n")
			.replace(/\n{3,}/g, "\n\n")
			.replace(/[ \t]+$/gm, "")
			.trim();
		body = `${body}\n`;

		// frontmatter
		const title = String(n.data.title ?? path.basename(n.file, ".md")).trim();
		const published = parseDate(n.data.published ?? n.data.date, n.file);
		const tags = normaliseTags([...(Array.isArray(n.data.tags) ? n.data.tags : n.data.tags ? [n.data.tags] : []), ...inlineTags]);
		const category = String(n.data.category ?? cfg.DEFAULT_CATEGORY).trim() || cfg.DEFAULT_CATEGORY;
		const description = String(n.data.description ?? "").trim();

		// 封面图：笔记自带 image 字段时尝试解析
		let image = "";
		if (n.data.image) {
			const src = resolveAsset(String(n.data.image), n.noteDir, assetIndex);
			if (src) {
				const base = path.basename(src);
				const safeName = `${shortHash(rel(src))}-${base}`;
				usedAssets.set(rel(src), { src, name: safeName });
				image = `./images/${safeName}`;
			}
		}

		const fm = ["---", `title: ${JSON.stringify(title)}`, `published: ${published}`];
		if (description) fm.push(`description: ${JSON.stringify(description)}`);
		if (image) fm.push(`image: '${image}'`);
		fm.push(`tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]`);
		fm.push(`category: ${JSON.stringify(category)}`);
		fm.push("draft: false");
		fm.push('lang: ""');
		if (n.data.updated) fm.push(`updated: ${parseDate(n.data.updated, n.file)}`);
		if (n.data.pinned === true || n.data.pinned === "true") fm.push("pinned: true");
		fm.push("---");

		// 正文为空时（只写了 frontmatter）不要留一串空行
		const content = body.trim() ? `${fm.join("\n")}\n\n${body}` : `${fm.join("\n")}\n`;
		outputs.push({ slug: n.slug, content, source: n.relPath });
		for (const [k, v] of usedAssets) allAssets.set(k, v);

		const assetNote = usedAssets.size ? `  [${usedAssets.size} 张图]` : "";
		log(`  ✓ ${n.relPath}`);
		log(`      → ${n.slug}.md  (${tags.length} 标签, ${category})${assetNote}`);
	}

	// ---- 写入 ----
	if (DRY_RUN) {
		log("\n干跑结束，未写入任何文件。");
		log(`将要写入 ${outputs.length} 篇文章、${allAssets.size} 张图片到 ${POSTS_DIR}`);
		return;
	}

	ensureDir(POSTS_DIR);

	// 先读上一轮清单：既用于清理，也用于判断"哪些文件是本脚本的产物"
	let previous = null;
	if (fs.existsSync(MANIFEST_PATH)) {
		try {
			previous = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
		} catch (e) {
			vlog(`  ! manifest 读取失败，跳过清理: ${e.message}`);
		}
	}

	// 清理上一轮的产物（只删 manifest 记过的，不碰你自己写的文章）
	let removed = 0;
	if (cfg.CLEAN && previous) {
		for (const s of previous.posts ?? []) {
			const p = path.join(POSTS_DIR, `${s}.md`);
			if (fs.existsSync(p)) {
				fs.unlinkSync(p);
				removed++;
			}
		}
		// 上一轮拷进来的图片一并清掉，避免换图后残留孤儿文件
		const imgDir0 = path.join(POSTS_DIR, "images");
		if (fs.existsSync(imgDir0)) {
			for (const f of previous.assets ?? []) {
				const p = path.join(imgDir0, f);
				if (fs.existsSync(p)) {
					fs.unlinkSync(p);
					removed++;
				}
			}
		}
	}

	// 安全闸：目标位置已存在、但不在上一轮清单里的文件，说明是你手写的同名文章，
	// 绝不覆盖，直接跳过并警告。
	const ownedSlugs = new Set(previous?.posts ?? []);
	const skipped = [];
	const writable = outputs.filter((o) => {
		const target = path.join(POSTS_DIR, `${o.slug}.md`);
		if (fs.existsSync(target) && !ownedSlugs.has(o.slug)) {
			skipped.push(o);
			return false;
		}
		return true;
	});

	for (const o of writable) {
		writeFileSafe(path.join(POSTS_DIR, `${o.slug}.md`), o.content);
	}

	if (skipped.length) {
		log("");
		log(`⚠ 跳过 ${skipped.length} 篇：目标位置已有同名的手写文章（不会被覆盖）`);
		for (const o of skipped) log(`    ${o.slug}.md  ←  库内 ${o.source}`);
		log("  想让它发布，请先把你手写的那篇改名或删掉。");
	}

	// 图片
	const imgDir = path.join(POSTS_DIR, "images");
	ensureDir(imgDir);
	for (const [key, a] of allAssets) {
		const dest = path.join(imgDir, a.name);
		try {
			fs.copyFileSync(a.src, dest);
			vlog(`  图片 ${a.name}  ← ${key}`);
		} catch (e) {
			console.error(`  ! 图片拷贝失败 ${key}: ${e.message}`);
		}
	}

	// manifest 只登记真正写出去的文件，跳过的同名手写文章不算在内，
	// 否则下一轮清理会把用户自己的文章删掉。
	writeFileSafe(
		MANIFEST_PATH,
		`${JSON.stringify(
			{
				generatedAt: new Date().toISOString(),
				vault: VAULT,
				posts: writable.map((o) => o.slug),
				assets: [...allAssets.values()].map((a) => a.name),
				sources: writable.map((o) => ({ slug: o.slug, source: o.source })),
			},
			null,
			2,
		)}\n`,
	);

	log("");
	log("─".repeat(64));
	log(`完成：${writable.length} 篇文章，${allAssets.size} 张图片`);
	if (skipped.length) log(`跳过（同名手写文章已存在）：${skipped.length} 篇`);
	if (removed) log(`清理旧产物：${removed} 个文件`);
	log(`文章目录：${POSTS_DIR}`);
	log("下一步：cd Firefly && pnpm dev   然后打开 http://localhost:4321");
	log("─".repeat(64));
}

/**
 * 只有当本文件被直接执行时才跑主流程。
 * 被 import 时（例如写单元测试、或在别的脚本里复用转换函数）只暴露下面的函数。
 */
const isDirectRun =
	process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
	main().catch((e) => {
		console.error("\n[未捕获错误]", e);
		process.exit(1);
	});
}

/* ------------------------------------------------------------------ *
 * 供测试/复用导出的内部函数（单元测试用 temp vault 直接调这些）
 * ------------------------------------------------------------------ */
export {
	parseYamlLite,
	splitFrontmatter,
	isPublished,
	parseDate,
	slugify,
	normaliseTags,
	resolveAsset,
	convertEmbeds,
	convertMdImages,
	convertWikiLinks,
	normaliseInlineTags,
	extractInlineTags,
	convertCallouts,
	stripComments,
	withProtectedRegions,
	buildAssetIndex,
	walk,
	rel,
	shortHash,
};
