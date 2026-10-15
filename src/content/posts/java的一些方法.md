---
title: "java的一些方法"
published: 2026-08-02
tags: ["java"]
category: "学习笔记"
draft: false
lang: ""
---

warning:
1.float位数是比long大的，float是10的38次方，long是9.22*10的18次方，但是float会丢失精度，只有七位数字精确

"hello.txt".*startsWith（Obsidian 内链：startsWith）*("he");  // true   以什么开头
"hello.txt".endsWith(".txt");  // true   以什么结尾
"hello.txt".contains("llo");   // true   包含什么（任意位置）
"hello.txt".equals("hello");   // false  完全相等

sc.nextLine()    //读行
sc.nextInt        //读整数
sc.nextDouble   //读小数

Math.round(3.6);        // 4 四舍五入
Math.ceil(3.2);         // 4.0 向上取整
Math.floor(3.8);        // 3.0 向下取
Math.random();          // [0.0, 1.0) 随机小数

list.remove("B");            // 只删第一个 "B"
list*.removeAll（Obsidian 内链：.removeAll）*(toRemove);    // 把所有 toRemove 里有的元素全删
list.retainAll(set);   // 反着来：只保留 set 里有的（求交集）
list.removeAll(set);   // 删掉 set 里有的（求差集）
list.clear();          // 全清空

e.getMessage()      // 异常描述字符串
e.printStackTrace() // 完整堆栈（开发时看）
e.getCause()        // 原始根因

java:
Character.isLetter(cs[i])  // 判断是否是字母（包括大写和小写）
c++:
isalpha(cs[i]) //判断是否是字母（包括大写和小写）
isalnum() //字母或数字

|方法|做什么|返回|会不会移动指针|
|---|---|---|---|
|`it.hasNext()`|只**检查**后面还有没有元素|`true` / `false`|**不会**|
|`it.next()`|**移动**到下一个元素，并返回它|元素本身|**会**|
`split(" ")` 是 String 的方法：**用括号里的分隔符，把字符串切成一段段的数组**。

### 异常处理

.getMessage()     打印异常信息
e.printStackTrace();             // 打印完整堆栈（调试利器）

### 关于统计map中出现次数写法：
for (String word : text.split(" ")) {

    count.put(word, count.getOrDefault(word, 0) + 1);

}

### 关于java中sort自定义lambda排序方法

sorted((e1, e2) -> e2.getValue() - e1.getValue())
//如果返回的是负数，就返回前一个e1；正数就e2；0就相等

`sorted` 想知道"谁在前谁在后"，需要一个**比较器**（Comparator）。比较器有个规矩：给你两个元素 e1、e2，你返回一个数字——

```java
返回负数 → e1 排前面
返回 0   → 一样大
返回正数 → e2 排前面
```

`(e1, e2) -> ...` 是**lambda 表达式**（第 6 章的接口知识：一个只有一个抽象方法的接口，可以这么简写）。

`e2.getValue() - e1.getValue()` 怎么解读？假设 e2 次数是 5，e1 次数是 2：

```java
e2 - e1 = 5 - 2 = 3（正数）→ 数字大（5）的 e2 排前面
```

所以"用 e2 减 e1" = **次数大的在前** = **降序**。这就是为什么 Top10 是从多到少。

> ⚠️ 注意别写反：如果写 `e1.getValue() - e2.getValue()`，就变成次数小的在前（升序）了。

### Bigdecimal的用法

为什么需要它：double 会"算错"

```java
System.out.println(0.1 + 0.2);
// 输出：0.30000000000000004   ← 不是 0.3！
```

原因：计算机用**二进制**存小数，而 `0.1` 在二进制里是无限循环小数，double 存不下就截断了。`0.3` 也一样截断，两个截断的数加起来自然对不上。

import java.math.BigDecimal;

// 创建（推荐这两种）
BigDecimal a = BigDecimal.valueOf(0.1);   // ✅ 常用
BigDecimal b = new BigDecimal("0.2");     // ✅ 传字符串也行

// 运算：不能直接 + - * /，要调方法
BigDecimal sum = a.add(b);        // 加
BigDecimal diff = a.subtract(b);  // 减
BigDecimal mul = a.multiply(b);   // 乘
BigDecimal div = a.divide(b, 2, RoundingMode.HALF_UP);
//                ↑ 除比较特殊：要指定保留几位小数 + 舍入方式（不然可能除不尽报错）

| 你要做的 | BigDecimal 写法                        | 注意                                 |
| ---- | ------------------------------------ | ---------------------------------- |
| 加    | `.add()`                             | 不能写 `+`                            |
| 比较大小 | `.compareTo(b)`                      | **不能用 `==`**，`compareTo` 返回负数/0/正数 |
| 转成显示 | `.toPlainString()`                   | 避免输出科学计数法 `1E+3`                   |
| 保留小数 | `.setScale(1, RoundingMode.HALF_UP)` | 四舍五入保留 1 位                         |

### 关于迭代器删除集合写法

public boolean removeById(String id) {

        Iterator<Student> it = students.iterator();

        while (it.hasNext()) {

            if (it.next().getId().equals(id)) {

                it.remove();          // 必须是迭代器删，不能 students.remove

                return true;

            }

        }

        return false;

    }

### 关于重写toString和HashCode的规则

## 配套规则（记死）

1. **equals 比了哪些字段，hashCode 就必须算哪些字段**。equals 只比 id，hashCode 就只能算 id——不能多算 name，否则两个 id 相同但 name 不同的对象，equals 说相等、hashCode 却不同，又撒谎了。
2. **IDEA 的 Alt + Insert 会一起生成 equals + hashCode**，保证它们自动配套，别自己拆开手写。
3. 例子：
4. @Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Student student = (Student) o;
    return id != null ? id.equals(student.id) : student.id == null;
}


@Override
public int hashCode() {
    return id != null ? id.hashCode() : 0;
}

### Set的应用：

// 应用1：列表去重（一行搞定）

List<String> list = Arrays.asList("a", "b", "a", "c", "b");

Set<String> unique = new LinkedHashSet<>(list);  // 去重且保序

System.out.println(unique);   // [a, b, c]



// 应用2：判断元素是否存在（比 List 快得多）

// HashSet 的 contains 是 O(1)，ArrayList 的 contains 是 O(n)

Set<String> blacklist = new HashSet<>();

if (blacklist.contains("非法用户")) {

    System.out.println("禁止访问");

}

### 保留原始异常
保留原始异常：
java 的 `Throwable`（所有异常的根类）内部有个字段叫 **`cause`（原因）**，专门用来记住"我这个异常，是由哪个原始异常引起的"。构造方法 `super(message, cause)` 就是干这个的：

```java
throw new BusinessException("配置读取失败", e);
//                                ↑          ↑
//                            给用户看的    原始异常（记进 cause）

// 内部链：BusinessException → super(message, cause) → RuntimeException → Exception → Throwable

**永远不要吞异常**：

```java

catch (Exception e) {

    // ❌ 什么都不做：异常被吞掉，bug 极难排查

}

catch (Exception e) {

    e.printStackTrace();   // ⚠️ 生产环境建议用日志框架（logback）替代

}
