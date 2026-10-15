---
title: "永于寒冬的java"
published: 2026-07-24
tags: ["java", "易犯错误", "文档注释与路径", "java-基础概念", "继承接口与多态", "封装super-与多态", "static-与-final", "抽象类与接口", "集合-collection", "异常体系", "scanner-输入", "io-流", "常用类string-等", "包装类", "正则表达式", "日期时间", "泛型", "反射", "vargettype-与-getreturntype", "注解", "多线程与并发", "lambda-表达式与函数式编程", "stream-api", "jvm-基础", "mysql-基础"]
category: "学习笔记"
draft: false
lang: ""
---

# Java 学习笔记

> 从 C++ 转向 Java 的过渡学习笔记，包含易犯错误、核心语法、集合、异常、IO、泛型、反射、注解、多线程、Lambda、Stream、JVM 与 MySQL 基础。

<!-- 目录 -->
- [易犯错误](`#易犯错误`)
- [文档注释与路径](`#文档注释与路径`)
- [Java 基础概念](`#java-基础概念`)
- [继承、接口与多态](`#继承接口与多态`)
- [封装、super 与多态](`#封装super-与多态`)
- [static 与 final](`#static-与-final`)
- [抽象类与接口](`#抽象类与接口`)
- [集合 Collection](`#集合-collection`)
- [异常体系](`#异常体系`)
- [Scanner 输入](`#scanner-输入`)
- [IO 流](`#io-流`)
- [常用类（String 等）](`#常用类string-等`)
- [包装类](`#包装类`)
- [正则表达式](`#正则表达式`)
- [日期时间](`#日期时间`)
- [泛型](`#泛型`)
- [反射](`#反射`)
- [var、getType 与 getReturnType](`#vargettype-与-getreturntype`)
- [注解](`#注解`)
- [多线程与并发](`#多线程与并发`)
- [Lambda 表达式与函数式编程](`#lambda-表达式与函数式编程`)
- [Stream API](`#stream-api`)
- [JVM 基础](`#jvm-基础`)
- [MySQL 基础](`#mysql-基础`)

---

## 易犯错误

1. 报错：找不到 XXX 文件时。源文件名不存在或写错。
2. 报错：XXX 类是公共的。类名与公共类的名不相符。

---

## 文档注释与路径

运行格式：

```text
java -d 文件地址 -xx -yy 公共类名.java
```

- 相对路径：从当前文件开始
- 绝对路径：从根目录开始
- `..\` 是上一文件的意思

---

## Java 基础概念

- JDK = JRE + 开发工具
- JRE = JVM + 核心类库

```java
import java.util.*;    // 相当于 C++ 里万能头文件

List<Integer> list = new ArrayList<>();   // 或 new LinkedList<>();
// set、map 写法基本相同
list.add(x);          // 添加
list.size();          // 大小
list1.equals(list2)   // 即 list1 == list2
```

**C++ 转 Java 记忆口诀：**

| C++ 的习惯               | Java 要改成                         |
| --------------------- | -------------------------------- |
| `==` 比较字符串            | `.equals()`                      |
| `->` 调用方法             | `.`                              |
| 多重继承 `class A : B, C` | `class A extends B implements C` |
| `if (x)` 判断非 0        | `if (x != 0)`                    |
| 指针 `int* p = &a`      | 不存在，只用引用                         |
| 泛型 `vector<int>`      | `ArrayList<Integer>`             |
| delete 手动释放           | 不管，JVM 自动回收                      |

---

## 继承、接口与多态

### 继承写法

| 方法           | 继承等价写法                          | 说明                |
| ------------ | ------------------------------- | ----------------- |
| `super()`    | `Animal(name)` / `: Base(name)` | ✅ 调用父类构造方法        |
| `super.name` | `Animal::name`                  | ✅ 访问父类成员          |
| `@Override`  | `virtual` + 函数签名一致              | ⚠️ **可选的**，不加也能重写 |

### extends

```java
class Dog extends Animal {
    // 子类继承父类，用 extends
}
```

### interface

```java
class Animal implements Flyable, Swimmable {}

// 既要继承又要写接口则：
class Duck extends Animal implements Flyable, Swimmable {}

// 接口内的函数用 @Override 重写
// 接口内 default 方法：有默认实现，实现类可以不重写
default void 函数名() {}
```

### 接口中的常量

```java
interface Config {
    // 接口里的变量默认就是 public static final
    int MAX_SIZE = 1000;
    String APP_NAME = "MyApp";
    // 相当于：
    // public static final int MAX_SIZE = 1000;
    // public static final String APP_NAME = "MyApp";
}

// 使用时：
System.out.println(Config.MAX_SIZE);     // 1000
System.out.println(Config.APP_NAME);     // MyApp
// Config.MAX_SIZE = 2000;               // ❌ 编译错误！final 不能修改
```

### 函数式接口 + Lambda（工作中用到爆）

只有一个抽象方法的接口叫**函数式接口**，可以配合 Lambda 表达式用：

```java
// 函数式接口（就一个方法）
interface Calculator {
    int calculate(int a, int b);
}

public class LambdaDemo {
    public static void main(String[] args) {
        // 传统写法：匿名内部类
        Calculator add = new Calculator() {
            @Override
            public int calculate(int a, int b) {
                return a + b;
            }
        };

        // Lambda 写法（工作中都这么写）
        Calculator add2 = (a, b) -> a + b;
        Calculator sub = (a, b) -> a - b;
        Calculator mul = (a, b) -> a * b;

        System.out.println(add2.calculate(3, 5));   // 8
        System.out.println(sub.calculate(10, 3));   // 7
        System.out.println(mul.calculate(4, 5));    // 20

        // Java 内置的函数式接口：Comparator
        List<String> list = Arrays.asList("banana", "apple", "cherry");
        list.sort((s1, s2) -> s1.compareTo(s2));
        System.out.println(list);  // [apple, banana, cherry]
    }
}
```

`java.util.Arrays` 封装了数组常用操作，**先会用，以后面试再深挖原理**：

```java
import java.util.Arrays;

public class ArraysDemo {
    public static void main(String[] args) {
        int[] arr = {5, 2, 8, 1, 9};

        // 排序（底层是优化的快速排序，算法课会讲）
        Arrays.sort(arr);
        System.out.println(Arrays.toString(arr));   // [1, 2, 5, 8, 9]

        // 二分查找（必须先排序！找不到返回负数）
        int index = Arrays.binarySearch(arr, 5);    // 2
        System.out.println(index);

        // 填充
        Arrays.fill(arr, 0);
        System.out.println(Arrays.toString(arr));   // [0, 0, 0, 0, 0]

        // 复制（扩容效果）
        int[] bigger = Arrays.copyOf(arr, 10);      // 新数组长度10，多出的补0
        int[] sub = Arrays.copyOfRange(arr, 1, 3);  // 复制 [1,3) 区间的元素

        // 比较
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};
        System.out.println(Arrays.equals(a, b));    // true（比较内容！）

        // 注意：== 比较的是引用，不是内容
        System.out.println(a == b);                 // false（两个不同的对象）
    }
}
```

---

## 封装、super 与多态

### 封装的写法：private + getter/setter

```java
public class Account {
    private double balance;   // 私有：外部不能直接访问

    public double getBalance() { return balance; }

    // setter 里做校验，拦截非法数据
    public void setBalance(double balance) {
        if (balance < 0) {
            throw new IllegalArgumentException("余额不能为负");
        }
        this.balance = balance;
    }

    public void withdraw(double amount) {
        if (amount > balance) {
            throw new IllegalArgumentException("余额不足，当前余额：" + balance);
        }
        balance -= amount;
    }

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("存款必须大于0");
        }
        balance += amount;
    }
}
```

**封装的三个好处：**

1. 保护数据：拦截非法值
2. 隐藏实现：调用者不用关心内部怎么算的
3. 便于修改：内部改逻辑，外部接口不变

> 💡 规则：**属性默认 private，通过 getter/setter 访问**。IDEA 的 Alt + Insert → Getter and Setter 一键生成。

### super 关键字

```java
super(...)     // 调用父类构造方法（必须在子类构造器第一行）
super.方法名() // 调用父类的方法（当子类重写后还想用父类的实现时）
```

> ⚠️ 子类构造方法**默认会先调用父类无参构造** `super()`。如果父类只有带参构造，子类必须显式 `super(参数)`。

### 什么是多态

**同一个方法，在不同对象身上，表现出不同行为。** 核心一句话：

> **父类引用指向子类对象，调用方法时执行的是子类的版本。**

```java
// 父类引用指向子类对象
Animal a = new Dog("旺财");
a.eat();   // "旺财在啃骨头" ← 编译看 Animal，运行看 Dog！

// 这样写的好处：
Animal[] animals = { new Dog("旺财"), new Cat("咪咪") };
for (Animal animal : animals) {
    animal.eat();   // 各自调用自己的 eat()
    // 但 animal.bark() ❌ 编译错误！Animal 类型没有 bark 方法
}

// 写一个方法，接受父类，任何子类都能传进来
public static void feed(Animal a) {
    a.eat();   // 以后加个 Pig 类，这个函数不用改
}

feed(new Dog("旺财"));
feed(new Cat("咪咪"));
feed(new Pig("哼哼"));   // 新增类型，老代码零修改
```

这句话展开就是 **开闭原则（Open-Closed Principle）**：

- **对扩展开放**：随便加新类（Pig、Bird、Tiger），系统都支持
- **对修改关闭**：加新类时，旧的 `feed` 方法一行都不用动

### 多态的三要素

1. 继承（或实现接口）
2. 方法重写
3. 父类引用指向子类对象

缺一个都不叫多态。

### instanceof

`instanceof` 是个**类型检查运算符**，就干一件事：**判断一个对象"实际上是不是"某种类型**。

```java
a instanceof Dog
```

结果只有 `true` / `false`。它问的问题是："`a` 指向的那个真实对象，是不是 `Dog`（或 `Dog` 的子类）？"

**关键点：instanceof 看的是"运行时真实类型"**

这是最容易懵的地方。`a` 有两个类型：

```java
Animal a = new Dog("旺财");
// 编译时类型（声明写的）     运行时类型（实际 new 出来的）
// Animal                    Dog
```

`instanceof` **只看运行时类型**：

```java
a instanceof Animal;   // true  —— 真身是 Dog，Dog 当然是 Animal（is-a）
a instanceof Dog;      // true  —— 真身就是 Dog
a instanceof Cat;      // false —— 真身不是 Cat
```

---

## static 与 final

### static

```java
// 静态方法里不能直接访问非静态成员！
static {
    // 静态代码块：类第一次加载时执行一次
    System.out.println("类被加载了");
}

public static void staticMethod() {}

public void instanceMethod() {
    // 实例方法里可以访问静态成员
    System.out.println(count);
}

StaticDemo.count = 10;              // 用类名访问（推荐）
StaticDemo.staticMethod();          // 不用 new 对象就能调用
```

### final

`final` = "不可变"的三种用法：

```java
final class FinalClass { }        // 1. 类不能被继承
final int MAX = 100;              // 2. 变量变成常量，不能改值
public final void method() { }    // 3. 方法不能被子类重写
```

面试常问组合：

- `static final` = 真正的常量：`public static final int MAX_VALUE = 100;`
- 常量命名全大写 + 下划线

---

## 抽象类与接口

### 抽象类

```java
abstract class 类名 {}
```

`abstract` 关键词：一旦出现抽象方法（即不带任何实现的方法），就要加上 `abstract` 了。

### 抽象类的规则

1. 用 `abstract` 修饰
2. **不能被实例化**：`new Shape("red")` ❌ 编译错误（一个抽象类没法"造实物"）
3. 抽象方法没有方法体，以分号结尾
4. **子类必须实现所有抽象方法**，除非子类也是抽象类
5. 抽象类**可以没有抽象方法**（少见但合法），但通常有
6. 抽象类**可以有构造方法**（供子类 super 调用）

### 抽象类 vs 接口（面试必考，对照记忆）

| 对比项 | 抽象类 | 接口 |
| --- | --- | --- |
| 关键词 | `abstract class` | `interface` |
| 继承方式 | `extends`（单继承） | `implements`（多实现） |
| 成员变量 | 任意类型、任意修饰 | 只能是 `public static final` 常量 |
| 构造方法 | **可以有** | **没有** |
| 普通方法 | 可以有实现 | Java 8 后有 default/static |
| 抽象方法 | 可以有 | 全部（除 default/static） |
| 语义 | "是什么"（is-a） | "能做什么"（can-do） |
| 设计意图 | 代码复用 + 模板 | 定义规范 + 解耦 |

### 模板方法的写法

```java
abstract class Beverage {

    // 模板方法：定死流程（final 防止子类篡改顺序）
    public final void make() {
        boilWater();      // 1. 烧水（都一样，父类实现）
        brew();           // 2. 冲泡（各不相同，子类实现）
        addCondiments();  // 3. 加料（各不相同）
        System.out.println("完成！");
    }

    void boilWater() {
        System.out.println("烧水");
    }

    abstract void brew();
    abstract void addCondiments();
}
```

> 📖 **小知识：可变参数 `...`（varargs）**
>
> - `Playable... players` 表示"可以传**任意多个** Playable 对象"，传 0 个、1 个、10 个都行。到方法内部被当成 `Playable[]` 数组用。
> - 调用时不用手写 `new Playable[]{...}` 和方括号，是语法糖。
> - ⚠️ 规则：必须是参数列表**最后一个**：`f(Playable... ps, int x)` ❌，`f(int x, Playable... ps)` ✅。
> - **核心思想**：`playAll` 只知道接口 `Playable`，`p.play()` 通过多态分发给各自的实现。以后加新的播放器类，这个方法一行都不用改——这就是**面向接口编程**。

如果两个接口有**同名 default 方法**怎么办？

```java
interface A { default void hello() { System.out.println("A的hello"); } }
interface B { default void hello() { System.out.println("B的hello"); } }

class C implements A, B {
    // 必须重写，否则编译报错（二义性）
    @Override
    public void hello() {
        A.super.hello();   // 可以指定调哪一个
        // 或自己写实现
    }
}
```

---

## 集合 Collection

### 数组的痛点

1. **长度固定**，想动态增删数据很麻烦
2. 查找、插入等操作都要自己写代码
3. 不能存放不同类型（当然，正常也不需要）

> ——————重要——————

**集合（Collection）** 解决了这些：长度动态、自带各种方法、体系完整。

```text
Collection（接口）——单列集合，一个个存
  ├── List（有序、可重复）
  │     ├── ArrayList     数组实现，查询快，增删慢
  │     ├── LinkedList    链表实现，增删快，查询慢
  │     └── Vector        老的线程安全类（很少用）
  ├── Set（无序、不可重复）
  │     ├── HashSet       哈希实现，存取快，顺序不定
  │     ├── LinkedHashSet 哈希+链表，保持插入顺序
  │     └── TreeSet       红黑树，自动排序
  └── Queue（队列，先进先出）

Map（接口）——双列集合，键值对
  ├── HashMap       哈希实现，key 无序
  ├── LinkedHashMap 保持插入顺序
  └── TreeMap       按 key 排序
```

**两个顶级接口的区别：**

- `Collection`：一次存一个元素（a, b, c...）
- `Map`：一次存一对（key → value）

### List 操作

```java
List<String> list = new ArrayList<>();

// 增
list.add("苹果");
list.add("香蕉");
list.add(0, "草莓");     // 在指定位置插入
list.addAll(Arrays.asList("橙子", "西瓜"));  // 批量添加

// 查
list.get(0);             // "草莓"
list.indexOf("香蕉");    // 找到下标，没有返回 -1
list.contains("苹果");   // true
list.size();             // 5
list.isEmpty();          // false

// 改
list.set(1, "菠萝");     // 把下标1的元素替换

// 删
list.remove(0);          // 按下标删除，返回被删元素
list.remove("苹果");     // 按元素删除（只删第一个匹配的）
```

### 遍历时删除元素（重点坑）

```java
// 方式3：迭代器（遍历时删除元素必须用它）
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if ("B".equals(s)) {
        it.remove();       // ✅ 迭代器删除是安全的
    }
}
```

> ⚠️ **重点坑：遍历时删除元素**。用 for-each 边遍历边 `list.remove()` 会抛 `ConcurrentModificationException`。正确做法：用迭代器 `it.remove()`，或收集到新列表再删。

```java
// 错误示范（会抛异常）
// for (String s : list) { if (xx) list.remove(s); }

// 推荐做法：先收集再删除
List<String> toRemove = new ArrayList<>();
for (String s : list) {
    if (s.startsWith("B")) toRemove.add(s);
}
list.removeAll(toRemove);
```

> 📖 **为什么遍历时删除会炸？（版本号对账）**
>
> - **for-each 底层就是迭代器**：`for (String s : list)` 会被编译器改写成 `iterator() + hasNext()/next()`。
> - list 每次**结构性修改**（add/remove）都会让 `modCount`（修改次数）加 1；迭代器创建时记下当时的版本号。
> - 迭代器每次 `next()` 都检查："list 当前版本号 == 我记的版本号？" 不等 → 抛 `ConcurrentModificationException`（fail-fast 快速失败）。
> - `list.remove(s)` 改了 list 但**没告诉迭代器** → 版本对不上 → 炸。
> - `it.remove()` 删完会**主动同步自己的版本号** → 下次 `next()` 对得上 → 安全。
> - 规则：`it.remove()` 必须在 `it.next()` **之后**调用，删的是"刚 next() 拿到的那个元素"，一次 next 只能删一次。
> - 现代替代：`list.removeIf(x -> 条件)` 一行搞定，内部就是迭代器删除。

### Set

```java
// LinkedHashSet：保持插入顺序 + 去重
Set<String> linked = new LinkedHashSet<>();

// TreeSet：自动排序 + 去重
Set<Integer> sorted = new TreeSet<>();
```

`getClass()` 也是从 `Object` 继承来的，作用是：**返回这个对象"出生时"的类**。

```java
Student s = new Student();
s.getClass();        // 返回 Student 这个类
```

```java
// 应用2：判断元素是否存在（比 List 快得多）
// HashSet 的 contains 是 O(1)，ArrayList 的 contains 是 O(n)
Set<String> blacklist = new HashSet<>();
if (blacklist.contains("非法用户")) {
    System.out.println("禁止访问");
}
```

> 有点跳跃，知识点在后面……但实际就是先判类型，再比字段。

#### HashSet 去重的原理（面试重点）

HashSet 存对象时，先看 **`hashCode()`**，hashCode 相同再看 **`equals()`**。

所以**自定义对象放进 HashSet 想要正确去重，必须同时重写 `hashCode()` 和 `equals()`**！

```java
public class Student {
    private String name;
    private int age;

    // 构造、getter 略...

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Student s = (Student) o;
        return age == s.age && Objects.equals(name, s.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}
```

### Map

```java
// 增/改
map.put("语文", 90);
map.put("数学", 85);
map.put("数学", 95);     // key 相同，覆盖旧值 → 数学变成95

// 查
map.get("数学");           // 95
map.getOrDefault("英语", 0);  // key不存在时返回默认值0（很常用！）
map.containsKey("语文");   // true
map.containsValue(90);     // true
map.size();                // 2

// 删
map.remove("语文");
```

### Map 遍历

| 方式 | 写法 | 怎么拿 key/value | 推荐度 |
| --- | --- | --- | --- |
| keySet | `map.keySet()` + `map.get(key)` | 先拿 key，再回头查 value | 只拿 key 时用 |
| **entrySet** | `entry.getKey()` / `entry.getValue()` | 一对直接拆 | **⭐ 最常用** |
| forEach | `(k, v) -> ...` | Lambda 自动给 | 简洁，面试爱问 |

```java
for (String key : map.keySet()) {
    System.out.println(key + "=" + map.get(key));
}
```

- `map.keySet()` → 返回一个装**所有 key** 的集合，比如 `[语文, 数学]`

```java
for (Map.Entry<String, Integer> entry : map.entrySet()) {  // 推荐
    System.out.println(entry.getKey() + "=" + entry.getValue());
}
```

- **`entry` 是什么**：一个"键值对"——就是把 `语文→90` 这一对当成一个整体对象。
- **`Map.Entry<String, Integer>` 是什么**：只是"一个键值对"的**类型名**，`<String, Integer>` 表示"这对儿里 key 是 String、value 是 Integer"。名字吓人，本质就是"一对"。
- **`map.entrySet()`** → 返回一个装**所有键值对**的集合，比如 `[语文=90, 数学=85]`
- **`entry.getKey()`** → 这一对的 key（语文）
- **`entry.getValue()`** → 这一对的 value（90）

**特点**：一次遍历，key 和 value 都到手，不用回头查。这是**最常用的写法**。

```java
map.forEach((k, v) -> System.out.println(k + "=" + v));   // Lambda
```

### HashMap 的工作原理（面试深度题，现在了解）

```text
数组 + 链表 + 红黑树（JDK 8+）
  1. put(key, value)：先算 key 的 hashCode，再对数组长度取模 → 定位桶
  2. 桶里没有元素 → 直接放
  3. 桶里有元素 → 用 equals 比较，相同则覆盖，不同则挂链表
  4. 链表太长（>8）→ 转红黑树（提高查找效率）
  5. 数组满了（负载因子0.75）→ 扩容为两倍
```

一句话总结：**HashMap = hashCode 定位置 + equals 找元素 + 链表/红黑树解决冲突**。

### 常用工具类

```java
// Arrays（第4章已讲）
int[] arr = {5, 2, 8};
Arrays.sort(arr);
Arrays.toString(arr);

// Collections（集合工具）
List<Integer> list = new ArrayList<>(Arrays.asList(3, 1, 2));
Collections.sort(list);          // [1, 2, 3]
Collections.reverse(list);       // [3, 2, 1]
Collections.max(list);           // 3
Collections.min(list);           // 1
Collections.shuffle(list);       // 打乱顺序
Collections.frequency(list, 1);  // 1 出现的次数
```

```java
// asList 返回的是"固定大小"的列表，不能增删！
List<String> list = Arrays.asList("A", "B");
// list.add("C");   ❌ UnsupportedOperationException
// list.remove(0);  ❌ UnsupportedOperationException
list.set(0, "X");    // ✅ 可以改

// 想要真正的可变列表：
List<String> real = new ArrayList<>(Arrays.asList("A", "B"));
```

### 练习：集合的交、并、差

```java
Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3));
Set<Integer> b = new HashSet<>(Arrays.asList(2, 3, 4));

Set<Integer> intersect = new HashSet<>(a);
intersect.retainAll(b);          // 交集 [2, 3]

Set<Integer> union = new HashSet<>(a);
union.addAll(b);                 // 并集 [1, 2, 3, 4]

Set<Integer> diff = new HashSet<>(a);
diff.removeAll(b);               // 差集（a 有 b 没有）[1]
```

---

## 异常体系

### Throwable 体系（必背）

```text
Throwable（一切错误的根）
  ├── Error（严重问题，程序无法恢复，别去 catch）
  │     ├── OutOfMemoryError      内存耗尽
  │     └── StackOverflowError    栈溢出（无限递归）
  │
  └── Exception（可以处理的问题）
        ├── RuntimeException（运行时异常，编译器不强制处理）
        │     ├── NullPointerException       空指针
        │     ├── ArrayIndexOutOfBoundsException 数组越界
        │     ├── ArithmeticException        算术异常（除以0）
        │     ├── NumberFormatException      数字格式错误
        │     ├── ClassCastException         类型转换错误
        │     └── IllegalArgumentException   参数非法
        │
        └── 检查异常（Checked Exception，编译器强制处理）
              ├── IOException    IO错误（文件读写）
              ├── SQLException   数据库错误
              └── ...
```

### 异常对照

```java
String s = null;
s.length();                      // NullPointerException
int[] arr = new int[3];
arr[5];                          // ArrayIndexOutOfBoundsException
int x = 1 / 0;                   // ArithmeticException
Integer.parseInt("abc");         // NumberFormatException
Object o = new Object();
String str = (String) o;         // ClassCastException
```

### 异常顺序

```java
try {
    String s = null;
    s.length();                     // NullPointerException
} catch (NullPointerException e) {
    System.out.println("空指针");
} catch (RuntimeException e) {
    System.out.println("运行时异常");
} catch (Exception e) {
    System.out.println("其他异常");
}
```

**顺序规则：子类在前，父类在后**。如果把 `Exception` 写在最前面，后面的 catch 永远不会执行（编译都报错）。

```java
catch (NullPointerException | ArrayIndexOutOfBoundsException e) {
    System.out.println("这两种异常用同一段逻辑处理");
}

// try-with-resources：自动关闭（要求资源实现 AutoCloseable）
try (BufferedReader br = new BufferedReader(new FileReader("a.txt"))) {
    // 读...
}   // 结束时自动 close，不用写 finally
```

> 💡 **从今以后写文件/数据库操作一律用 try-with-resources**，是行业标准写法。

### throw vs throws

- `throw` → 在方法内部"主动抛出"一个异常对象
- `throws` → 在方法签名上"声明"这个异常可能被抛出，让调用者处理

> **`throw` 触发的那一刻，当前方法立刻终止；异常被 `catch` 接住后，程序从 catch 块后面继续运行——中断的代码永远不执行。`throws` 只是"我可能抛，你自己接"的声明，不改变任何流向。**

一个方法里如果多个异常，throws 可以写多个：`throws IOException, SQLException`。

### 调用者的两条路（就这俩，二选一）

| 选择 | 写法 | 效果 |
| --- | --- | --- |
| **接住** | `try { 调用 } catch (IOException e) {...}` | 异常就地解决，程序继续 |
| **甩锅** | 自己方法签名加 `throws IOException` | 异常继续往上弹，交给更上层 |

选接住还是甩锅，取决于**这个层能不能处理**：

- 底层的 `readFile` 不知道上层想怎么办 → 甩锅合理
- 中间层也不知道 → 继续甩
- 到 `main`（或能给出用户提示的那层）→ 必须接住
- 再接不住就是 JVM 接，直接报错

### 自定义异常（企业开发标配）

系统里想抛"业务异常"（如余额不足、用户名已存在），Java 自带的异常表达不了语义，就自定义。

```java
// 业务异常：继承 RuntimeException（Spring 项目主流选择）
// 好处：不需要到处写 throws，代码更干净
public class BusinessException extends RuntimeException {
    private int code;      // 错误码，给前端用

    public BusinessException(String message) {
        super(message);
        this.code = 500;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
```

#### 使用自定义异常

```java
public class BankAccount {
    private double balance;

    public void withdraw(double amount) {
        if (amount <= 0) {
            throw new BusinessException(400, "取款金额必须大于0");
        }
        if (amount > balance) {
            throw new BusinessException(400, "余额不足，当前余额：" + balance);
        }
        balance -= amount;
    }

    public static void main(String[] args) {
        BankAccount acc = new BankAccount();
        try {
            acc.withdraw(1000);
        } catch (BusinessException e) {
            System.out.println("错误码：" + e.getCode() + "，" + e.getMessage());
        }
    }
}
```

---

## Scanner 输入

### ⚠️ nextInt / nextLine 混用的经典坑

```java
sc.nextInt();
sc.nextLine();
```

会报错的，读出来的是空串。

**原因**：`nextInt()` 只读了数字 `20`，**回车符 `\n` 留在缓冲区**，`nextLine()` 读到的是那个回车。

**解决：在 nextInt 后加一句 `sc.nextLine()` 吃掉回车**：

```java
int age = sc.nextInt();
sc.nextLine();          // 吃掉残留的回车
String name = sc.nextLine();   // ✅ 正常读到
```

### hasNextInt 判断输入是否合法（配合循环）

```java
Scanner sc = new Scanner(System.in);
// 输入一串数字，以非数字结尾停止
// hasNextInt() 判断后面是否为数字
while (sc.hasNextInt()) {
    sum += sc.nextInt();
}
```

---

## IO 流

### 字符流 vs 字节流（核心概念）

```text
字节流（读写任意二进制：图片、视频、音频、文本）
  InputStream / OutputStream
  ├── FileInputStream / FileOutputStream
  └── BufferedInputStream / BufferedOutputStream

字符流（读写文本，处理编码）
  Reader / Writer
  ├── FileReader / FileWriter
  ├── BufferedReader / BufferedWriter
  └── InputStreamReader / OutputStreamWriter（桥接）
```

**怎么选？**

- 文本文件（.txt、.java、.csv）→ **字符流**（更方便）
- 二进制文件（图片、视频、压缩包）→ **字节流**（字节流能处理一切）

> 💡 文件读写几乎都要涉及 IO 异常，用 `throws IOException` 或 try-catch。

### 写文件的三种方式

```java
// 1. FileWriter
FileWriter writer = new FileWriter("output.txt");
writer.write("Hello");
writer.write(System.lineSeparator());  // 换行功能
writer.close();                        // 原理同 C，不关会写不进去

// 2. 用 try-with-resources + BufferedWriter（推荐用这种）
try (BufferedWriter file = new BufferedWriter(new FileWriter("output.txt"))) {
    file.write("Hello");
    file.newLine();           // 换行
}
// BufferedWriter 会自动关闭

// 3. 最简洁：Files
Files.writeString(Path.of("output.txt"), "Hello, File!\n第二行");

// 4. (Extra) 追加模式：和方法2差不多，但 new FileWriter("output.txt", true) 第二个参数 true
try (BufferedWriter file = new BufferedWriter(new FileWriter("output.txt", true))) {
    file.newLine();
    file.write("追加内容");
}
```

### 读文件的两种方式

> 💡 **生产环境惯例**：日志、配置、大文件用 BufferedReader 逐行；小配置/JSON 用 Files.readString。

```java
// 1. 依旧 BufferedReader（大文件）
try (BufferedReader file = new BufferedReader(new FileReader("output.txt"))) {
    String line;
    while ((line = file.readLine()) != null) {
        System.out.println(line);
    }
}

// 2. 用 Files 类工具（小文件，一次全读完）
String content = Files.readString(Path.of("output.txt"));
System.out.println(content);

// 3. Files.readAllLines → List<String>
List<String> content = Files.readAllLines(Path.of("output.txt"));
for (String s : content) {
    System.out.println(s);
}
```

### 字节流复制文件（图片/任意文件）

```java
public class Copy {
    public static void main(String[] args) throws IOException {
        try (FileInputStream in = new FileInputStream("a.jpg");
             FileOutputStream out = new FileOutputStream("b.jpg")) {
            // 一次读 4096 个而非一个，加速进程
            byte[] buffer = new byte[4096];
            // len 返回此次实际读取到的字节长度，如果结尾是 -1 就停止
            int len = 0;
            while ((len = in.read(buffer)) != -1) {
                // 用 buffer 写入，从 0 开始，以实际长度为读取标准
                out.write(buffer, 0, len);
            }
        }
        System.out.println("完成");
    }
}
```

### 路径与分隔符

```java
// 相对路径：相对"项目当前目录"（IDEA 里就是项目根目录）
File f1 = new File("data.txt");

// 绝对路径
File f2 = new File("D:/workspace/data.txt");   // Windows 可以用 /

// 目录操作
File dir = new File("mydir");
dir.mkdir();          // 创建单层目录
dir.mkdirs();         // 创建多层目录
dir.exists();         // 是否存在
dir.listFiles();      // 列出子文件

// 判断
File f = new File("data.txt");
f.exists();
f.isFile();
f.isDirectory();
f.length();           // 字节数
f.getName();
f.delete();
```

```java
Files.copy("a.txt", "b.txt");     // 直接把 a 复制到 b
Files.copy(Path.of("a.jpg"), Path.of("b.jpg"), REPLACE_EXISTING);   // 如果 b 有内容就覆盖复制
```

---

## 常用类（String 等）

**结论：**

- `==` 比较的是**引用**（是不是同一个对象）
- `equals` 比较的是**内容**（字符串是否相同）

> ⚠️ **开发铁律：字符串比较永远用 `equals()`**，绝不用 `==`。这是新人最常见的 bug 之一。

### String 常用方法大全

```java
public class StringDemo {
    public static void main(String[] args) {
        String s = "Hello, World";

        s.length();                 // 12
        s.charAt(0);                // 'H'
        s.toUpperCase();            // "HELLO, WORLD"
        s.toLowerCase();            // "hello, world"
        s.trim();                   // 去首尾空白
        s.substring(0, 5);          // "Hello"（[0,5) 左闭右开！）
        s.substring(7);             // "World"（从7到末尾）
        s.indexOf("World");         // 7（找不到返回 -1）
        s.lastIndexOf('o');         // 8（最后一次出现的位置）
        s.contains("llo");          // true
        s.startsWith("He");         // true
        s.endsWith("ld");           // true
        s.replace("World", "Java"); // "Hello, Java"（替换所有匹配）
        s.replaceAll("\\d", "#");   // 正则替换
        s.split(",");               // ["Hello", " World"] 按逗号拆
        s.isEmpty();                // false
        s.isBlank();                // Java11+ 空白/空串都算

        // 比较
        s.equals("Hello, World");           // true（内容比较）
        s.equalsIgnoreCase("hello, world"); // true（忽略大小写）
        s.compareTo("Hello, A");            // 字典序比较，返回差值

        // 转换
        String.valueOf(123);        // "123"
        Integer.parseInt("123");    // 123（String → int）
        s.toCharArray();            // char[]
        String.join("-", "a", "b", "c");  // "a-b-c"（好用！）
    }
}
```

> 💡 **注意 `substring` 是左闭右开** `[start, end)`，`substring(0, 5)` 取的是 0,1,2,3,4 五个字符，不含 5。

### StringBuilder：可变字符串（拼接神器）

**为什么循环拼接不要用 `+`**：因为如果在循环内部拼接的话，会由于 String 不可变导致创造太多变量。

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < n; i++) {
    sb.append(i);
}
String result = sb.toString();
```

> 💡 **铁律**：单线程拼接字符串，用 StringBuilder；对字符串的任何"修改"在循环里，必须 StringBuilder。

---

## 包装类

### 为什么要包装类

集合只能存对象，不能存 `int`。所以每个基本类型都有对应的"包装类"：

| 基本类型 | 包装类 | 基本类型 | 包装类 |
| --- | --- | --- | --- |
| int | **Integer** | double | Double |
| byte | Byte | char | **Character** |
| short | Short | float | Float |
| long | Long | boolean | Boolean |

```java
int i = Integer.parseInt("123");       // 常用
double d = Double.parseDouble("3.14");
boolean b = Boolean.parseBoolean("true");
int n = Integer.valueOf("100");        // 返回 Integer 对象
// 也可以有 int i = Integer.parseInt(sc.nextLine());
```

**数字 → String：**

```java
String s1 = String.valueOf(123);
String s2 = 123 + "";
```

### random 的用法

```java
ThreadLocalRandom.current().nextInt(10);    // 0~9 随机整数
ThreadLocalRandom.current().nextInt(0, 11); // 0~10 随机整数
```

如果括号内只有一个数，那么默认它为上界，从 0 到上界。

---

## 正则表达式

```java
"abc123".replaceAll("\\d", "*");      // "abc***"
"a,b;c".split("[,;]");                // [a, b, c] 按逗号或分号拆
"hello123".replaceFirst("\\d", "#");  // "hello#23"
```

`\\d` 即是 `\d`，只代表数字，`\\d+` 即多个数字。

```java
Map<String, Long> freq = Arrays.stream(text.split("\\W+"))   // \\W+ = 连续的非字母数字处切开
```

**常用正则符号：**

```text
\d    数字                     \w    字母数字下划线                \s    空白
+     一个或多个               *     0个或多个                    ?     0或1个
{n}   恰好n个                 ^     开头                        $     结尾
[a-z] 字符范围                |     或
```

```java
// 判断手机号（简单版：11位，1开头）
String phone = "13800138000";
boolean ok = phone.matches("^1\\d{10}$");

// 判断邮箱
String email = "abc@test.com";
boolean ok2 = email.matches("^\\w+@\\w+\\.\\w+$");
```

---

## 日期时间

```java
// 当前时间
LocalDateTime now = LocalDateTime.now();

// 指定时间
LocalDate day = LocalDate.of(2026, 1, 1);

// 格式化
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");  // 定格式
String s = now.format(fmt);     // 转化格式

// 解析（格式化的逆进程，将格式日期转为字符串，并且格式必须完全一样，否则抛错）
LocalDateTime parsed = LocalDateTime.parse("2024-01-01 10:00:00", fmt);

// 计算
LocalDate today = LocalDate.now();
LocalDate tomorrow = today.plusDays(1);
int year = today.getYear();
DayOfWeek dow = today.getDayOfWeek();

// 时间差
LocalDateTime start = LocalDateTime.of(2024, 1, 1, 0, 0);
Duration d = Duration.between(start, LocalDateTime.now());
long days = d.toDays();
```

---

## 泛型

泛型对应 C++ 的模板 `template <typename T>`，Java 泛型和它**长得像，本质完全不同**：

- C++：**编译期代码生成**，每个具体类型都生成一份独立代码，`Vector<int>` 和 `Vector<double>` 是两个不同类
- Java：**类型擦除**，编译后只有一份，运行时类型信息被抹掉，`List<String>` 和 `List<Integer>` 是同一个类

> C++ 模板是"编译期真的造出多个类"，Java 泛型是"编译期只有一套代码，编译器靠类型参数帮你在编译时做检查，检查完就把类型信息擦掉了"。

### 泛型类与泛型方法

```java
class Pair<K, V>                 // 可以多个参数！K/V 是 key/value 的缩写
class StringBox extends Box<String>   // 继承时把 T 具体化，这个类里 item 就固定是 String 了
```

```java
// 泛型方法：<T> 必须在返回值前面，表示"这个方法用到的类型参数"
public static <T> T getLast(T[] array)
```

怎么知道该方法需不需要泛型？**只要方法内部要"处理多种类型"，且希望每种类型下行为一致**，就用泛型方法。典型场景：工具类里的 `swap`、`排序`、`数组转列表`。

```java
// <T extends Comparable<T>>：T 必须实现了 Comparable（可比较接口）
// Comparable 是"比较"接口：实现了它的类型就能和同类比较大小
// compareTo()，按字典序排序，返回差值
public static <T extends Comparable<T>> T max(T a, T b) {
    // 调用 compareTo：a 比 b 大返回正数，相等返回 0，小返回负数
    return a.compareTo(b) >= 0 ? a : b;
}
```

> 📖 **上界 `extends` 的含义**：`T extends Comparable<T>` 意思是"T 必须是 Comparable 的子类型"（实现 Comparable 也算）。加了上界后，`T` 就能调用 `Comparable` 里的方法了（否则 T 被擦除成 Object，只有 Object 的方法可用）。

高频小细节：**接口的泛型方法里不能出现基本类型**，泛型接口默认用的 `T` 在被擦除后会变成 `Object`。

### 什么是类型擦除

Java 泛型**只在编译期存在**。编译器用 `<T>` 做类型检查，检查完成后，会把 `T` 替换成 `Object`（或上界），然后把泛型信息**擦掉**。JVM 运行时**根本不知道泛型这回事**。

```java
// 源代码里：
List<String> list = new ArrayList<>();

// 编译之后（运行时看到的样子）：
// List list = new ArrayList();   ← 类型参数被擦掉了
```

> 所以其实就是菱形运算符在编译之后基本都会被擦除吧，然后都只剩下 ArrayList 类。

```java
System.out.println(new Box<String>().getClass() == new Box<Integer>().getClass());  // true
```

因为擦除，下面这些操作**都是编译错误**：

```java
// ① 不能用基本类型当泛型参数
// List<int> list = ...;          // ❌ 编译错误

// ② 不能创建泛型数组
// T[] arr = new T[10];
// ❌ 编译错误（T 被擦除了，new 不知道造什么数组）

// ③ instanceof 不能判断泛型类型
// if (list instanceof List<String>)  // ❌ 编译错误：泛型信息已擦除，无法判断
if (list instanceof List) {
    // ✅ 只能判断到"它是一个 List"
}

// ④ 静态成员不能使用类的类型参数
class Box<T> {
    static T item;                // ❌ 编译错误：静态成员属于类，而类运行时没有 T
    static T getItem() {...}      // ❌ 同样错误
}

// ⑤ 泛型类的对象之间不能强转
// Box<String> b = (Box<String>) new Box<Integer>();  // ⚠️ 编译警告，运行可能炸
```

> 📖 **为什么静态成员不能用类的 T？** 因为 `Box<String>` 和 `Box<Integer>` 运行时**是同一个类** `Box`，静态成员是"属于类"的，如果静态成员是 `T` 类型，那它到底是 String 还是 Integer？没法确定，所以干脆禁止。

### 泛型不变（invariance）

```java
List<String> strList = new ArrayList<>();
// List<Object> objList = strList;  // ❌ 编译错误！List<String> 不是 List<Object> 的子类
```

> ⚠️ 这是最容易踩的坑：**泛型不变（invariance）**。`List<String>` 和 `List<Object>` 是"平等"的两个类型，谁也不是谁的子类。为什么？因为如果允许，`objList.add(new Object())` 就会把一个 Object 塞进"应该是 String"的列表里，破坏类型安全。

### 通配符 `?`

通配符就是能接受所有类型的泛型。

```java
List<?> list;
for (Object s : list) {}

String strList = List.of("hello");     // List.of 就是创建只读列表
Object objList = List.of("1", "2");
printList(strList);
```

`List.of` 和 `Arrays.asList` 一样，都是只读。

### 上界通配符 `? extends T`（只读）

`Number` 是所有基本数据类型的父类，所以基本上我们都是用 `? extends Number`。

```java
// 传入的到底是 List<Integer> 还是 List<Double>？调用时才能确定
// 所以往里 add 什么都可能"放错"→ 编译器禁止
// nums.add(???)   ❌ 编译错误：无法确定元素具体类型，禁止写入
```

> 意思就是 Number 是父类，你传的 Integer 等等都只是他的子类，所以读的时候至少都是 Number，信息完全，可以轻松读出；但如果 add 的话，就会出错。

例：

```java
public static double sum(List<? extends Number> nums) {
    double total = 0;
    for (Number n : nums) {        // 按父类 Number 读，一定安全
        total += n.doubleValue();  // doubleValue()：转成 double，Number 提供的方法
    }
    return total;
}
```

> 📖 **记法**：`? extends Number` 可以理解成"Number 或它的子类"，取出来**至少是 Number**，读是安全的；但写的时候不知道具体是哪个子类，所以禁止写。**只能读、不能写**。

### 下界通配符 `? super T`（可写）

```java
public static void addNumber(List<? super Integer> list) {
    list.add(100);                 // ✅ 可以写！存 Integer 进 Integer 或它的父类列表，永远安全
    // Integer i = list.get(0);    // ❌ 读取有问题：不知道具体是哪个父类，取出来只能当 Object
}
```

> 因为它存储的类型，要么是 Integer 或 Integer 的父类（Number/Object），所以写进去的时候，你传的基本类型是肯定能行的，而读的时候就不确定是 Object 还是 Number，那么只能读到 Object 了。

**为什么 `? super` 能写、读起来反而受限？**

```java
// list 存的一定是 Integer 或 Integer 的父类（Number/Object）
// 往里 add 一个 Integer，在任何情况下都合法（子类可以赋值给父类）→ 能写 ✅
// 但 get 出来可能是 Number 也可能是 Object，无法确定 → 只能当 Object 读 ❌
```

### 应用场景

**`? extends` → 一切"拿来读、算、显示"的函数**

- 求和、求平均、求最大最小、打印、统计……凡是"只读一个数字列表"的通用函数
- 返回值只读 API（比如"返回一个只读的 List"用 `List<? extends T>` 防止外面改）

**`? super` → 一切"往里塞"的函数**

```java
public static void addAll(List<? super Integer> list, int... values) {
    for (int v : values) list.add(v);   // 写 Integer，目标列表永远是安全的
}
addAll(new ArrayList<Integer>());   // ✅
addAll(new ArrayList<Number>());    // ✅ Integer 存进 Number 列表，永远合法
addAll(new ArrayList<Object>());    // ✅
```

> 一句话收尾：**`? extends` = 只读工具，`? super` = 只写工具，`List<T>` = 又读又写但锁死一种类型。** 需要"同时收多种类型"才用通配符，收多种的代价就是牺牲一个方向。

泛型是**所有框架的骨架**。现在把泛型类、泛型方法、通配符掌握好，学 Spring Boot 时看 `Result<T>`、`BaseMapper<T>` 这些代码会非常轻松。

### 练习：泛型方法找最大值（带 `? extends Comparable` 上界）

```java
// 上界写法：T 必须是 Comparable（可比较）的子类型
public static <T extends Comparable<T>> T max(T[] array) {
    if (array.length == 0) return null;
    T result = array[0];
    for (int i = 1; i < array.length; i++) {
        if (array[i].compareTo(result) > 0) {   // compareTo：比较大小，返回差值
            result = array[i];
        }
    }
    return result;
}
```

---

## 反射

> 📖 **反射（Reflection）**：程序在**运行时**动态地获取一个类的完整信息（字段、方法、构造方法...），并直接操作这些成员的能力。可以理解成"程序照镜子，看穿自己"。

| 传统写法 | 反射写法 |
| --- | --- |
| 编译期就确定类和对象，代码写死 | 运行时才知道是哪个类，类名可以是变量/字符串 |
| 直接 `obj.method()` 调用 | 通过字符串方法名去找到方法再调用 |
| 无法访问 private 成员 | `setAccessible(true)` 后可以操作私有成员 |
| 无法动态创建"未知"的类 | `Class.forName(类名字符串)` 创建任意类 |

> `Class` 是**类**，`class` 是**关键字**。小写的 `class` 是定义类用的，大写的 `Class` 是反射的主角——千万别搞混。反射里 `Class<?>` 中的 `?` 是通配符。

### 反射的三个核心角色

| 类 | 作用 | 类比 |
| --- | --- | --- |
| `Class` | 类的"说明书"，获取入口 | 字典本身 |
| `Field`（字段） | 描述一个成员变量 | 字典里的一条词条 |
| `Method`（方法） | 描述一个方法 | 字典里的一条词条 |
| `Constructor`（构造方法） | 描述一个构造方法 | 字典里的一条词条 |

### 获取 Class 对象

```java
public class GetClassDemo {
    public static void main(String[] args) throws ClassNotFoundException {
        // 方式1：类名.class（编译期就知道是哪个类，最推荐）
        Class<?> c1 = Student.class;

        // 方式2：对象.getClass()（已有对象，运行时拿到它的类）
        Student s = new Student();
        Class<?> c2 = s.getClass();

        // 方式3：Class.forName("完整类名")（★最灵活：类名是字符串，可以动态指定）
        // 完整类名 = 包名.类名（真实项目里如 com.example.Student）
        // 本教材的类都写在"默认包"（没写 package 语句），所以这里直接写类名 Student
        Class<?> c3 = Class.forName("Student");

        // 三种方式拿到的是同一个 Class 对象（每个类只有一份）
        System.out.println(c1 == c2);   // true
        System.out.println(c1 == c3);   // true

        // Class 对象能告诉你的基本信息
        System.out.println(c1.getName());           // 完整类名：Student（有包时是"包名.类名"）
        System.out.println(c1.getSimpleName());     // 简写类名：Student
        System.out.println(c1.getSuperclass());     // 父类：class java.lang.Object
        System.out.println(c1.isInterface());       // 是不是接口：false
    }
}
```

| 获取方式 | 写法 | 说明 |
| --- | --- | --- |
| 类名.class | `Student.class` | 编译期确定，无异常，最常用 |
| 对象.getClass() | `s.getClass()` | 运行时获得，需要先有对象 |
| Class.forName() | `Class.forName("字符串")` | 类名是字符串，可动态传入（★框架核心用法） |

> 注意：`Class.forName()` 的参数字符串写错（类名不存在）会抛 `ClassNotFoundException`，所以要么 `try-catch`，要么方法上 `throws`。

反射所有操作的第一步，都是拿到 `Class` 对象。记住这句："**先拿 Class，再干活**"。

### 反射操作字段 Field

`Field` 描述一个成员变量。可以读取、可以修改，甚至能碰 private 的。

**整个 Declared 家族：**

| 方法 | 拿什么 | 能拿 private 吗 |
| --- | --- | --- |
| `getField("name")` | public 字段 | ❌ |
| `getDeclaredField("name")` | 本类所有字段 | ✅ |
| `getMethod("study")` | public 方法 | ❌ |
| `getDeclaredMethod("getGrade")` | 本类所有方法 | ✅ |
| `getConstructor(...)` | public 构造 | ❌ |
| `getDeclaredConstructor()` | 本类所有构造 | ✅ |

带复数 `s` 的是"全部"：`getDeclaredFields()` = 本类所有字段（含 private），`getDeclaredMethods()` = 本类所有方法（含 private）。

```java
public static void main(String[] args) throws Exception {
    // 1. 拿到 Class
    Class<?> clazz = Student.class;

    // 2. 创建对象（用无参构造，newInstance 创建实例）
    Student stu = (Student) clazz.getDeclaredConstructor().newInstance();

    // 3. 获取字段：getDeclaredField("名字") 能拿到私有字段
    Field nameField = clazz.getDeclaredField("name");
    // getField("名字") 只能拿 public 字段；getDeclaredField 可以拿所有字段

    // 4. 解除私有限制！private 字段默认不能碰，setAccessible(true) 放行
    nameField.setAccessible(true);

    // 5. 写入：set(对象, 值) 给字段赋值
    nameField.set(stu, "小明");

    // 6. 读取：get(对象) 取出字段值
    String name = (String) nameField.get(stu);   // 返回的是 Object，要强转

    System.out.println("name = " + name);   // name = 小明

    // public 字段不用 setAccessible 也能操作
    Field ageField = clazz.getField("age");
    ageField.set(stu, 20);
    System.out.println("age = " + ageField.get(stu));  // age = 20
}
```

> - `getField()` / `getMethods()`：只返回 **public** 成员（含继承来的）
> - `getDeclaredField()` / `getDeclaredMethods()`：返回**本类所有**成员（含 private，不含继承）

### 反射操作方法 Method

`Method` 描述一个方法，用 `invoke()` 来调用它。

无论如何都是先创建一个对象：

```java
Student stu = (Student) clazz.getDeclaredConstructor().newInstance();

// ————————公有————————
Field nameField = clazz.getDeclaredField("name");
Method studyMethod = clazz.getDeclaredMethod("study");

// 为 nameField 赋值
nameField.setAccessible(true);
nameField.set(stu, "elaina");

// invoke 调用
studyMethod.invoke(stu);

// ————————私有————————
Method gradeMethod = clazz.getDeclaredMethod("getGrade");
gradeMethod.setAccessible(true);   // 私有方法同样要放行
Object result = gradeMethod.invoke(stu);   // 返回值是 Object
System.out.println(result);        // 输出：不及格（age 还没设）

// ===== 调用带参数的方法 =====
// getMethod("方法名", 参数类型.class...) 要传参数的类型！
Method setNameMethod = clazz.getMethod("setName", String.class);   // 参数类型写成 .class
setNameMethod.invoke(stu, "小刚");   // 第二个参数起是方法实参
```

> 📖 **invoke 的语义**：`method.invoke(对象, 参数...)` 等价于 `对象.method(参数...)`。方法有返回值时，invoke 会返回一个 `Object`（需要强转）；方法无返回值时返回 `null`。
>
> 💡 获取方法时**参数类型要写成 `.class`**：`getMethod("add", int.class, int.class)`。因为一个类里可能有同名方法（重载），必须靠"方法名 + 参数类型列表"才能唯一确定是哪一个。

#### 获取一个类的所有方法

```java
Method[] methods = clazz.getDeclaredMethods();
for (Method m : methods) {
    System.out.println(m.getName() + "，返回类型：" + m.getReturnType());
}
// study，返回类型：void
// getGrade，返回类型：class java.lang.String
```

### 反射操作构造方法 Constructor

```java
Class<?> clazz = Student.class;

// ————无参构造——————
Constructor<?> noArgCons = clazz.getConstructor();
Student stu1 = (Student) noArgCons.newInstance();
System.out.println(stu1);

// 如果类有无参构造，一行搞定
Student stu3 = (Student) clazz.getDeclaredConstructor().newInstance();

// ————有参构造—————
// getConstructor(参数类型.class...) 指定要找哪个构造方法
Constructor<?> argCons = clazz.getDeclaredConstructor(String.class, int.class);
Student stu2 = (Student) argCons.newInstance("小明", 20);  // 传入实参
```

> **经典坑**：`newInstance()` 调的是**无参构造**。如果类没有无参构造（比如只有一个带参构造），这里会报错。Spring 框架要求 JavaBean 必须有无参构造，原因之一就是反射创建对象方便。
> 所以定义类的时候尽量写个无参，写个有参。

```java
// 打印对象：通用 toString
StringBuilder sb = new StringBuilder();
// getSimpleName 是获取类名，getName 是获取包名和类名
sb.append(clazz.getSimpleName()).append("{");
sb.append(f.getName())              // 字段名
  .append("=")
  .append(f.get(obj));              // 字段值
// 结果：Student{name=小红, age=19}
```

> 想打印 JDK 自带的类（`"hello"`、`Integer`）时注意：JDK 17+ 的模块化让 `java.base` 包默认拒绝反射访问，会抛 `InaccessibleObjectException`。用 JDK 8 可跑通，或只打印自己写的类（如 `Student`）——框架反射的都是你的业务类，不受影响。
>
> 💡 看！**同一个 `print` 方法，没写任何 `if` 判断，却能打印任何对象**。这就是反射的威力：代码不用知道对象的具体类型。框架做 JSON 序列化、数据库映射全靠这一招。

### 框架是怎么"自动干活"的

- 传统开发：你 new 对象，你调方法 —— 一切都由你控制
- 框架开发：框架 new 对象，框架调方法 —— 你只负责"告诉它类名/规则"

### 反射的代价（面试常问）

| 优点 | 缺点 |
| --- | --- |
| 运行时动态创建对象、调方法 | 性能比直接调用慢（约慢一个数量级） |
| 可以操作 private 成员 | 破坏封装，代码可读性变差 |
| 是框架的基础，无可替代 | 反射异常（如 NoSuchMethodException）在运行时才暴露，不像编译期安全 |

> 💡 实际开发里，**框架用反射，业务代码很少直接用**。你写 Spring 业务代码时不用手写反射，框架帮你做了。学反射的目的是：理解框架原理、会读框架源码、面试能答。

**私有方法用这个 Object：**

```java
Object stu = clazz.getDeclaredConstructor().newInstance();
```

**怎么判断使用 Object 创建对象还是 Student 创建？**

| 判断依据 | 用 `Object` | 强转 `(Student)` |
| --- | --- | --- |
| **编译时知道是哪个类吗？** | 不知道（类名是字符串/配置来的） | 知道（`Student.class` 写死了） |
| **要调这个类的特有方法吗？** | 不用，用反射 `Method.invoke` 调 | 要，`stu.study()` 直接调 |
| **写的是通用工具吗？** | 是（ObjectPrinter，要对任何类工作） | 不是（就是针对 Student 写死的） |

### 反射实现的简易"工厂"——根据类名创建对象

```java
// 反射工厂：传入完整类名，返回新对象
public static Object create(String className) throws Exception {
    Class<?> clazz = Class.forName(className);
    return clazz.getDeclaredConstructor().newInstance();
}

public static void main(String[] args) throws Exception {
    Object obj = create("Student");     // 换别的类名也照样工作
    System.out.println(obj.getClass().getSimpleName());  // Student
}
```

---

## var、getType 与 getReturnType

### var 的定义

`var` 是 Java 10 引入的**局部变量类型推断**：你不用写类型，编译器看等号**右边**的表达式自己推断。写完 `var nameField = ...`，编译器自动知道它是 `Field`。

```java
Object o = "hello";
o.length();      // ❌ 编译错！编译期类型是 Object，Object 没有 length()

var s = "hello";
s.length();      // ✅ 编译期类型是 String，能直接调 String 的方法！
```

| 能放哪 | 不能放哪 |
| --- | --- |
| ✅ 方法内部的局部变量 | ❌ 成员变量（字段） |
| ✅ for 循环变量 `for (var s : list)` | ❌ 方法参数 |
|  | ❌ 方法的返回值类型 |

还有三个硬规则：

- **必须初始化**：`var x;` 不行，编译器没法猜
- **不能赋 null 当初始值**：`var x = null;` 猜不出来是啥类型
- **类型中途不能变**：`var x = 1; x = "a";` 不行，x 已经定型为 int

**右边类型很啰嗦时**用它最爽。比如：

```java
// 写全（C++ 里那种长长的类型名）
Map<String, List<Student>> map = new HashMap<>();

// 用 var：右边已经写清楚了，左边不用重复
var map = new HashMap<String, List<Student>>();
```

Java 也认可**右边类型长、左边一眼能看出来**时用 `var` 是推荐风格（像 `var list = new ArrayList<Student>();`）。

### getType() 和 getReturnType()

```java
Field f = ...;              // 某个字段，比如 name
System.out.println(f.getType());   // 输出：class java.lang.String（name 的类型）
// 所以如果是 f.getType().getSimpleName() 就直接是 String，去掉了前面的包

// 字段：f.getType() = 字段的类型（String/int...），再取简写名
System.out.println(f.getType().getSimpleName() + " " + f.getName());
// String name
// int age

// 方法：m.getReturnType() = 方法的返回类型
System.out.println(m.getReturnType().getSimpleName() + " " + m.getName() + "()");
// void study()
// String getGrade()
```

---

## 注解

**注解是什么？**

> 注解 = 贴在代码上的"标签"。它本身不做任何事，但可以被**编译器、框架、反射**读取，从而影响程序的行为。

### 内置注解

```java
// @Deprecated：标记"已过时，不推荐使用"
// 别人调用这个方法时，编译器会给出警告（画一条删除线）
@Deprecated
public void oldMethod() {
    System.out.println("老方法，别用了");
}

// @SuppressWarnings：抑制编译器警告
// 比如你知道这个强转很安全，让它别啰嗦
@SuppressWarnings("unchecked")
public void cast() {
    // 这里故意写一个"不安全"的强转，编译器不会报警告了
    Object obj = new String("hello");
    String s = (String) obj;
}
```

### 元注解：注解的注解

元注解就是"用来修饰注解的注解"，它们决定了你的注解**长什么样、能用在哪、活多久**。

- **@Retention**：注解存活到什么时候。（`SOURCE` 源码 / `CLASS` 字节码 / **`RUNTIME` 运行时**)
  - ⚠️ `@Retention` 有三个值：`SOURCE`（只在源码里，编译后消失，如 `@Override`）、`CLASS`（默认值，进字节码但不进内存）、`RUNTIME`（进字节码且在运行时保留，反射才能读到）。**记不住就无脑写 `RUNTIME`**。
- **@Target**：注解能用在什么位置。（`FIELD` 字段 / `METHOD` 方法 / `TYPE` 类 / `PARAMETER` 参数）
- **@Documented**：是否出现在 javadoc 文档里
- **@Inherited**：子类是否继承

### 自定义注解（核心语法)

**用 `@interface` 定义，里面的成员是"没有方法体的方法"。**

```java
// 这里的 @Target 数组写法：可以同时用在多种位置
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)

// ② 成员：只能是 基本类型 / String / Class / 枚举 / 注解 / 以及它们的一维数组
//    （Integer 等包装类、Object 等普通类都不能做成员类型）
// ④ 数组成员：用法 @MyAnnotation(tags = {"a", "b"})
String[] tags() default {};

// 只有一个 value 成员，可以省略 "value ="，直接写
@MyAnnotation("这是用户名")
private String username;

// 多个成员，都要写出来（有 default 的可不写）
@MyAnnotation(value = "年龄", priority = 2, tags = {"重要", "数字"})
private int age;
```

> ⚠️ **注解成员不能是 `null`**！它没有 `null` 这个概念，不写就取 `default` 默认值。想表达"没设置"，就约定一个特殊默认值，比如 `default ""` 空字符串。

### 注解示例

```java
// ① 定义（第3节）：造标签
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyField {
    String name() default "";
}

// ② 使用（第4节）：贴标签
@MyField(name = "用户名")
private String username;

// ③ 读取（第5节）：反射读标签
MyField annotation = field.getAnnotation(MyField.class);
```

> tip: **注解的作用对象 = 紧跟它后面的那个声明**。比如上面的 name 注解，就是贴给后面新定义的 username 这一变量的。

### 完整代码

```java
import java.lang.annotation.*;
import java.lang.reflect.*;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@interface MyField {
    String name() default "";
    boolean required() default false;
}

public class Annotation {
    @MyField(name = "elaina", required = true)
    private String name;

    public static void main(String[] args) throws Exception {
        Field[] fields = Annotation.class.getDeclaredFields();
        for (Field field : fields) {
            MyField annotation = field.getAnnotation(MyField.class);
            if (annotation != null) {
                System.out.println("字段：" + field.getName() + " " + "注解 name：" + annotation.name() + " " + "required:" + annotation.required());
            }
        }
    }
}
```

> 💡 常用判断套路：`field.isAnnotationPresent(MyField.class)` —— 返回 `true/false`，比 `getAnnotation() != null` 更直观。

### 校验逻辑

```java
if (field.isAnnotationPresent(MaxLength.class)) {
    field.setAccessible(true);
    Object value = field.get(obj);
    MaxLength anno = field.getAnnotation(MaxLength.class);
    if (value != null && value.toString().length() > anno.max()) {
        throw new IllegalArgumentException(anno.message());
    }
}
```

---

## 多线程与并发

💡 一个进程至少有一个线程（主线程），Java 程序的入口 `main` 方法就运行在主线程上。理解"多线程"其实就是**多个方法同时往前走，共享同一片内存**。

**与 C 的 pthread 对照表（全章都用到，先存着）：**

| 你要做的事 | C（pthread） | Java |
| --- | --- | --- |
| 创建线程 | `pthread_create(&t, NULL, func, arg)` | `new Thread(r).start()` |
| 当前线程是谁 | `pthread_self()` | `Thread.currentThread()` |
| 让线程睡一下 | `usleep(1000)` | `Thread.sleep(1000)` |
| 等子线程结束 | `pthread_join(t, NULL)` | `t.join()` |
| 互斥锁 | `pthread_mutex_lock(&m)` / `unlock` | `synchronized(对象) { ... }` |
| 线程安全的计数 | 手动加锁 | `AtomicInteger` 原子类 |

### 创建线程的三种方式（面试必背）

#### 方式一：继承 Thread

```java
// 继承 Thread 类，重写 run() 方法
// run() 里写的是"这个线程要干的活"
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("我是方式一：" + Thread.currentThread().getName());
    }
}
```

> 📖 `Thread.currentThread().getName()`：拿到"当前正在执行的线程"对象并获取名字。主线程默认叫 `main`，我们 new 出来的线程默认叫 `Thread-0`、`Thread-1`…

#### 方式二：实现 Runnable（推荐）

```java
// Runnable 是一个接口
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("创建线程方法" + Thread.currentThread().getName());
    }
}

public class ThreadDemo {
    public static void main(String[] args) {
        // Runnable 是要实现的任务，而 Thread 是实现任务的线程
        // 创建新线程 t 后，让他开始跑任务
        Thread t = new Thread(new MyRunnable());
        t.start();
    }
}
// 注意！是 start() 启动线程，不是 run()
// start() 会让 JVM 开一条新线程去执行 run()
// 直接调 run() 只是在当前线程里"普通调用一个方法"，不算多线程
```

**为什么推荐方式二？（面试常问）**

1. Java 是单继承，如果用继承 Thread 方法的话会占用继承，而接口 interface 不同，没有这种限制
2. 接口能继续复用，也就是说这个任务可以多线程并跑
3. 线程池只能接受 Runnable/Callable，不能接受 Thread

#### 方式三：实现 Callable（有返回值、能抛异常）

```java
class MyCallable implements Callable<Integer> {
    @Override
    public Integer call() {
        // ...
        return 42;
    }
}

public class ThreadDemo3 {
    public static void main(String[] args) throws Exception {
        // FutureTask 是一个"装了任务的盒子"，实现类自己也是 Runnable
        // 所以能直接扔给 Thread。注意：FutureTask 和 Callable 都是新类，照抄先记住
        FutureTask task = new FutureTask(new MyCallable());

        // 像 Runnable 一样启动
        new Thread(task).start();

        // task.get()：阻塞等待，直到子线程算完并返回结果
        // ⚠️ get() 会抛 InterruptedException 和 ExecutionException，
        // 所以 main 方法上写了 throws Exception
        Integer result = task.get();
        System.out.println("成功");
    }
}
```

> 📖 这里出现了一个写法：`new MyCallable()` 后面的泛型 `Integer` 是泛型知识。

#### 三种方式对比

| 方式 | 优点 | 缺点 | 适用场景 |
| --- | --- | --- | --- |
| 继承 Thread | 简单直接 | 单继承限制；任务和线程耦合 | 简单演示 |
| 实现 Runnable | 解耦、可复用、可配合多继承 | 无返回值 | **日常首选** |
| 实现 Callable | **有返回值、能抛异常** | 稍复杂，要包一层 FutureTask | 需要拿结果的场景 |

### 线程生命周期与常用方法

#### 六种状态

`Thread.State` 枚举定义了线程的 6 种状态，面试常考：

```text
NEW(新建) → RUNNABLE(就绪/运行) → TERMINATED(终止)
                │
                ├── BLOCKED(阻塞：等锁，没抢到 synchronized)
                ├── WAITING(等待：调了 wait/join，等别人唤醒)
                └── TIMED_WAITING(计时等待：sleep 固定时间)
```

```java
Thread t = new Thread(() -> {
    try {
        Thread.sleep(1000);  // 睡 1 秒 → 进入 TIMED_WAITING
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
});
```

> `() -> {...}` 就是用 Lambda 写的一个**一次性 Runnable**：

```java
// 等价写法（匿名内部类）
new Thread(new Runnable() {
    @Override
    public void run() {
        try { Thread.sleep(1000); } catch (InterruptedException e) { e.printStackTrace(); }
    }
});
```

加上 try-catch 原因：`sleep` 声明会抛 `InterruptedException`，而它是**受检异常（checked）**——编译器要求你必须处理，不处理**编译不过**。而 run 方法是接口定死的名称，不能用 throws。

```java
Thread t = new Thread(() -> { ...睡1秒... });  // ① 造好，状态 NEW
System.out.println(t.getState());              //   打印 NEW
t.start();                                     // ② 启动
Thread.sleep(100);                             //   主线程睡 100ms
System.out.println(t.getState());              //   打印 TIMED_WAITING（子线程正睡着）
t.join();                                      // ③ join() 是等子线程结束，等它跑完
System.out.println(t.getState());              //   打印 TERMINATED
```

### 线程安全问题（本单元最核心）

#### 为什么 count++ 会出错

两个 count 同时 ++ 一万次，结果很可能小于 20000，因为有可能同时读取到的都是 100，那么 ++ 之后就都是 101，但是已经加了两次，这种叫"竞态条件"。

> 📖 集合里的 `ArrayList`、`HashMap` 也不是线程安全的，多线程同时 add/put 也可能出问题。线程安全要靠"锁"来保证。

#### synchronized：给代码上锁

`synchronized` 是 Java 的**内置锁**，对应 C 的 `pthread_mutex`。**同一时刻，只有一个线程能进入被锁的代码块**，其他线程在门口排队等着，直到持有锁的线程执行完释放锁。

**synchronized 上锁的三个方式：**

```java
public class Counter {
    private int count = 0;

    // 锁方法：进入这个方法必须先拿到 this 对象的锁
    public synchronized void increment() {
        count++;
    }

    // 方法二：锁代码块，this 是当前 Counter 对象
    public void increment2() {
        synchronized (this) {
            count++;
        }
    }
}

Counter counter = new Counter();   // 所有线程共享这一个对象
// t1 和 t2 都在调 increment()，里面的 this 都是同一个 counter
// → 都去抢 counter 这把锁 → 互斥 ✅
// 进了这个类后，你就都是用 this 对象，共用这一个，只有这样，你们才要竞争，才需要互斥锁，
// 所以括号里是 this，如果是 new Object()，那么就不会需要 synchronized

// 方式三：锁静态方法，锁的是 Class 对象（类本身）
public static synchronized void increment3() {
    // 静态方法里没有 this，锁的是 Counter.class
}
```

> 💡 synchronized 最大的好处：**不用手动释放锁**。C 里 `pthread_mutex_unlock` 忘写就死锁，Java 里只要退出 `synchronized` 代码块（包括抛异常），锁自动归还。这也是 Java 相比 C 并发编程更安全的原因之一。

### 原子类 AtomicInteger（锁的轻量替代）

`synchronized` 是"锁"，`AtomicInteger` 是"无锁"方案。它内部用了 CPU 级别的 **CAS 原子指令**，保证 `incrementAndGet()` 这类操作**天然是原子的、线程安全的**，而且比加锁更快。

```java
// 原子计数器：new AtomicInteger(初始值)
AtomicInteger count = new AtomicInteger(0);
// 两个线程各加 1 万次，结果稳定等于 20000，不需要 synchronized
// 是 for 循环中用 count.incrementAndGet() 方法
// 最后 start(), join()
```

**常用方法：**

| 方法 | 作用 |
| --- | --- |
| `incrementAndGet()` | 加 1 并返回新值（`++i`） |
| `getAndIncrement()` | 返回旧值再加 1（`i++`） |
| `addAndGet(n)` | 加 n 并返回 |
| `get()` / `set(n)` | 读 / 写 |

> ⚠️ `AtomicInteger` 只对**单个变量**的操作原子。如果一段逻辑要同时改多个变量、或先读后写依赖旧值，还是要用 `synchronized`。**原子类不是万能锁。**
>
> 📖 类似的原子类还有 `AtomicLong`、`AtomicBoolean`、`AtomicReference<T>`，用法一样。

### 线程池（重点！）

#### 为什么用线程池，不用 new Thread？

每个线程的创建和销毁都有开销。网站高峰期每秒来 1 万个请求，每个请求都 `new Thread` 再销毁，性能崩掉。

**线程池的思想：提前建好一批线程放着，有任务就扔给空闲的线程干，干完线程不销毁，继续接下一个任务。**

**好处：**

1. 避免频繁创建/销毁线程的开销（复用线程）
2. 限制并发数量，防止系统资源被耗尽
3. 方便统一管理（任务队列、超时、监控）

#### Executors 工厂方法（简单入门）

```java
// 固定 4 个线程的线程池：一次最多同时跑 4 个任务，多余的排队
// ExecutorService 是"线程池"的接口，newFixedThreadPool 是 JDK 给我们的现成工厂方法
ExecutorService pool = Executors.newFixedThreadPool(4);
```

**Executors 常见工厂：**

| 工厂方法 | 线程池类型 | 适用 |
| --- | --- | --- |
| `newFixedThreadPool(n)` | 固定 n 个线程 | 稳定的并发任务 |
| `newCachedThreadPool()` | 线程数动态伸缩，空闲 60s 回收 | 短平快任务 |
| `newSingleThreadExecutor()` | 只有一个线程 | 需要保证任务按顺序执行 |
| `newScheduledThreadPool(n)` | 可定时/周期执行 | 定时任务 |

> ⚠️ **面试坑：阿里《Java 开发手册》明确禁止用 `Executors` 的这几个工厂方法**，因为它们内部用了"无界队列"，任务太多时可能 OOM。大厂都要求**手动 `new ThreadPoolExecutor`**。所以 Executors 只用来入门理解，真正干活请用下一节的写法。

#### ThreadPoolExecutor 七大参数

`ThreadPoolExecutor` 是线程池的真正实现类，构造方法有 7 个参数：

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
        2,                                         // ① 核心线程数 corePoolSize：常驻线程，不干活也不销毁
        5,                                         // ② 最大线程数 maximumPoolSize：忙的时候最多扩张到 5 个
        60L,                                       // ③ 空闲存活时间 keepAliveTime
        TimeUnit.SECONDS,                          // ④ 时间单位
        new ArrayBlockingQueue<>(10),              // ⑤ 任务队列：排队等线程处理的"待办清单"
        Executors.defaultThreadFactory(),          // ⑥ 线程工厂：用默认的就行
        new ThreadPoolExecutor.AbortPolicy()       // ⑦ 拒绝策略：队列也满了、线程也满了怎么办
);
```

**拒绝策略（第 ⑦ 个参数）有 4 种：**

| 策略 | 行为 |
| --- | --- |
| `AbortPolicy` | **直接抛异常**（默认，最常用） |
| `CallerRunsPolicy` | 让提交任务的那个线程自己干（不丢任务） |
| `DiscardPolicy` | 悄悄丢掉新任务 |
| `DiscardOldestPolicy` | 丢掉队列里最老的任务 |

#### 提交带返回值的任务：submit + Future

```java
Future<Integer> future = pool.submit(() -> {
    Thread.sleep(1000);       // 模拟耗时计算
    return 40 + 2;            // 计算结果
});

System.out.println("结果 = " + future.get());
```

> 📖 `Future` 就是上节 `FutureTask` 的"接口版本"——`FutureTask` 实现了 `Future` 接口。用法一样：`get()` 拿结果。它们都是新类，先记住"submit 返回 Future，get() 拿结果"。
>
> future 就是一个装载未来结果的容器，直接用 future 输出只会输出地址。

`get()` 干了三件事：

1. **阻塞等待**——如果线程还没算完，就在这里停住等（和 `join()` 一样等，区别是它还带回一个返回值）
2. **取出结果**——把容器里的 `Integer` 掏出来
3. **放进变量**——返回类型是 `Integer`（泛型里那个），能直接用了

> 打个比方：`future` 是**快递取件码**，`get()` 是**走到快递柜前取包裹**。取件码不是包裹，得靠它去取，取的时候如果快递还没到，就在柜前等着。

### JUC 并发工具

#### CountDownLatch：等 N 个线程都干完

```java
// 初始化计数为 3，表示要等 3 件事
CountDownLatch latch = new CountDownLatch(3);
for (int i = 0; i < 3; i++) {
    int taskId = i;
    new Thread(() -> {
        System.out.println("子线程" + taskId + "开始");
        try { Thread.sleep(1000); } catch (Exception e) {}
        System.out.println("子线程" + taskId + "结束");
        latch.countDown();
    }).start();
}

// latch.await()：当前线程（main）阻塞等待，直到计数器归零
latch.await();
System.out.println("子线程结束，主线程继续");
```

> 💡 `join()` 和 `CountDownLatch` 都能等线程结束，区别：`join()` 是"等某个线程对象"；`CountDownLatch` 是"等某件事完成"，更灵活（比如 3 个线程各完成一件子任务）。

#### ConcurrentHashMap：线程安全的 HashMap

```java
// ConcurrentHashMap：专为多线程设计的 HashMap
Map<String, Integer> map = new ConcurrentHashMap<>();

Thread t1 = new Thread(() -> {
    for (int i = 0; i < 5; i++) map.put("a" + i, i);
});
Thread t2 = new Thread(() -> {
    for (int i = 0; i < 5; i++) map.put("b" + i, i);
});
```

### 易错点

**常见坑：**

1. **共享变量没加锁** → 竞态，结果不对（count++ 案例）。
2. **死锁**：两个线程互相持有对方想要的锁，谁都不放。写锁嵌套时要小心，尽量一个方法只锁一个对象。
3. **锁的对象不一致**：用 `synchronized(this)` 却对**不同的对象**加锁，等于没锁。
4. **忘调 `join()`**：主线程提前结束，子线程结果还没算完就拿来用。
5. **忘调 `shutdown()`**：线程池不关，非守护线程让程序退不出。
6. **Integer 用 `==` 比较**（值>127 时比较的是对象地址）：线程里比较计数结果时要用 `.equals()`。

---

## Lambda 表达式与函数式编程

### 为什么需要 Lambda

#### 痛点：代码不能"当参数传"

#### 与 C/C++ 的对比：函数指针的 Java 版

| 语言 | 传"行为"的方式 | 例子 |
| --- | --- | --- |
| C | 函数指针 | `qsort(arr, n, 4, cmp)` |
| C++ | lambda（C++11） | `std::sort(v, [](int a,int b){return a<b;});` |
| Java | **Lambda（Java 8+）** | `list.sort((a, b) -> a - b);` |

> C++11 的 lambda 长这样：`[捕获](参数) -> 返回类型 { 函数体 }`；Java 简化成 `(参数) -> 函数体`。两者本质相同：**就地定义一个行为，不写完整类**。

### Lambda 语法：三条规则掌握

#### 基本形式

```text
(参数列表) -> { 方法体; }
```

#### 三条简化规则

1. **参数类型可以省略**：编译器从上下文推断
2. **只有一个参数时，可以省略小括号**
3. **方法体只有一条语句时，可以省略花括号和 return**（这条语句表达式的值就是返回值）

```java
// 规则1：省略参数类型（编译器知道 a、b 是 int）
(a, b) -> { return a + b; }

// 规则3：方法体只有一行 → 去掉花括号和 return
(a, b) -> a + b

// 规则2：单参数 → 去掉小括号
n -> n * n
```

### 四大内置函数式接口

#### Consumer：消费一个数据

```java
public static void main(String[] args) {
    Consumer<String> print = s -> System.out.println(s);   // 拿一个字符串，打印它

    print.accept("你好，Lambda");   // accept() 就是"消费一次"

    // 集合的 forEach 就接收一个 Consumer
    List<String> list = Arrays.asList("A", "B", "C");
    list.forEach(print);            // 把 Consumer 直接传进去
}
```

```java
List<String> list = Arrays.asList("A", "B", "C");
list.forEach(print);            // 把 Consumer 直接传进去
```

- `List.forEach()` 方法接受一个 `Consumer`
- 对集合中的每个元素调用 `accept()` 方法
- 效果：依次打印 A、B、C

#### Supplier：产生一个数据

```java
Supplier<String> hello = () -> "这是 Supplier 生产的值";  // 无参数，返回结果

String value = hello.get();
// 用了 get 才拿得到值

// 应用：延迟生成。不调用 get() 就不执行 → 按需生产
Supplier<Double> s = () -> Math.random();
s.get();
s.get();   // 每调用一次就重新生成一次
```

#### Function：转换数据

```java
Function<String, Integer> fun = s -> s.length();   // 输入的是 String，输出 Integer

fun.apply("elaina")    // 应用 function 转化，输出结果为 6

// 链式：先取长度，再乘 2（前一个的输出，作为后一个的输入）
Function<Integer, Integer> doubleIt = n -> n * 2;
int result = length.andThen(doubleIt).apply("hello"); // length=5 → 5*2=10
```

> `andThen` = **组装**（把两个函数接成一条流水线，返回一个新的 Function）。在这里就是把 fun 和 doubleIt 连起来，然后在括号里的就是后执行的，在 `.andThen` 前面的就是先执行的。

#### Predicate：判断真假

```java
Predicate<Integer> isEven = n -> n % 2 == 0;

// 组合：and / or / negate（就是 &&、||、! 的函数版）
Predicate<Integer> isPositive = n -> n > 0;
Predicate<Integer> isPositiveEven = isEven.and(isPositive);
```

> 其他：`BiFunction<T,U,R>`（两个输入、一个输出）、`UnaryOperator<T>`（输入输出同类型）。

### Lambda 在集合中的实战

#### 给 List 排序：Comparator 的 Lambda 化

```java
fruits.sort((a, b) -> a.length() - b.length());      // 按长度升序
System.out.println(fruits);   // [date, apple, banana, cherry]

// 更稳的写法：Integer.compare，避免 a - b 可能溢出 int
fruits.sort((a, b) -> Integer.compare(a.length(), b.length()));
```

> 比较数字时请养成用 `Integer.compare(a, b)` 的习惯，而不是 `a - b`：当结果超出 int 范围时会算出错误的符号。

#### 方法引用 `::`（重点记）

**方法引用**是 Lambda 的"进一步简化"：当 Lambda 的代码就是"调用某个现成的方法"时，可以直接写 `类名::方法名`。

```java
// 完整 Lambda
list.forEach(s -> System.out.println(s));

// 方法引用：直接说"调用 System.out 的 println 方法"
list.forEach(System.out::println);

// 1. 某类的实例方法引用：String::compareTo
//    等价于 (a, b) -> a.compareTo(b)（compareTo 是字符串比较）
names.sort(String::compareTo);

// 3. 静态方法引用：Integer::compare 作为比较器
List<Integer> nums = Arrays.asList(5, 3, 8, 1);
nums.sort(Integer::compare);          // 等价于 (a, b) -> Integer.compare(a, b)
System.out.println(nums);   // [1, 3, 5, 8]
```

#### 变量捕获：Lambda 里的"外部变量"（重点）

```java
int base = 10;

base = 20;    // 之后又改了 → 不再有效 final ❌

Function<Integer, Integer> f = n -> n + base;   // 编译报错！
```

> 📖 **为什么必须"有效 final"？** Lambda 本质是方法，在堆上运行；外层局部变量在栈上。如果两边都可能改，变量就会"不同步"。所以 Java 干脆规定：Lambda 捕获的局部变量**只读**，逻辑上就是个常量，也就不会出问题。（真正的 `final` 和"声明后没改过"的变量都算"有效 final"。）
>
> ⚠️ 捕获**成员变量**（类字段）没有这个限制，因为字段本就在堆上，大家都看得到。这个区别面试常问。

### 易错点

1. **不是所有接口都能配 Lambda**：必须是函数式接口（一个抽象方法）。两个抽象方法会编译报错。
2. **`@FunctionalInterface` 只是提醒**：去掉不影响运行，但它能在编译期阻止你给接口多加抽象方法。
3. **`this` 的含义**：Lambda 里 `this` 指向**外层类的 this**，而不是匿名内部类那种"自己的匿名类实例"。这是两者关键区别，面试爱考。
4. **变量捕获的"有效 final"**：捕获后不能改，改了编译失败。
5. **方法引用别滥用**：逻辑复杂（多条语句）时，写完整 Lambda 更清晰。
6. **Lambda 没有名字、没有 this（自己的）、不能有成员变量**——它只是"行为"，不是对象。

---

## Stream API

### Stream：只描述"做什么"

```java
List<Student> students = new ArrayList<>();
students.stream()
        .filter(s -> s.getScore() >= 60)
        .sorted((s1, s2) -> s2.getScore() - s1.getScore())
        .limit(3)
        .forEach(System.out::println);
```

> Java 的 Stream 更进一步，把操作**串成链**，一次调用描述整条流水线。

### Stream 的三个基本概念

1. **数据源**：集合、数组（本身不动，Stream 只是"视图"）
2. **中间操作**：filter、map...，返回新的 Stream，**惰性执行**（不立刻算）
3. **终止操作**：collect、forEach、count...，**立刻执行**，返回最终结果

### 获取 Stream 的三种方式

```java
// 方式1：集合 .stream()（最常用）
List<String> arr = Arrays.asList("ae", "rs");
Stream<String> s = arr.stream();

// 方式2：数组 → Arrays.stream()
String[] arr = {"A", "B"};
Stream<String> s2 = Arrays.stream(arr);

// 方式3：Stream.of() 直接包一堆数据
Stream<Integer> s3 = Stream.of(1, 2, 3);
```

### 中间操作（惰性，返回新 Stream）

```java
// filter：筛选（用 Predicate）
.filter(n -> n % 2 == 0)        // 第 15 章学的 Predicate：n -> boolean

// map：转换（用 Function）
.map(s -> s.length())           // 第 15 章学的 Function：s -> 结果

// distinct / limit / skip
List<Integer> nums = Arrays.asList(3, 1, 3, 2, 1);
List<Integer> distinct = nums.stream().distinct().collect(Collectors.toList());  // 去重 [3,1,2]
List<Integer> first2  = nums.stream().limit(2).collect(Collectors.toList());     // 取前2个 [3,1]
List<Integer> after2  = nums.stream().skip(2).collect(Collectors.toList());      // 跳过前2个 [3,2,1]

// limit + skip = 分页：一页 2 条，取第 2 页
List<Integer> page2 = nums.stream().skip(2).limit(2).collect(Collectors.toList());  // [3,2]

// sorted：降序，大的在前
.sorted((a, b) -> b - a)
// 实际就是，是负数就返回前一个数，正数就返回后一个数
```

```java
List<Integer> result = IntStream.rangeClosed(1, 20)     // IntStream：生成 1..20
        .boxed()                                        // int → Integer 装箱
        // 操作方法...
        .collect(Collectors.toList());
```

> 📖 **IntStream** 是"基本类型 int 的专用流"，避免装箱开销。`IntStream.rangeClosed(1, 20)` 生成 1~20 的整数流。因为中间产物是 int，最后用 `boxed()` 装成 `Stream<Integer>` 才能 `collect(Collectors.toList())`。处理 int 数组、求和时很有用，先认识它即可。

```java
// 方法引用                          // 等价的 Lambda
Integer::compareTo            ≡    (a, b) -> a.compareTo(b)
// 结果：负数（a<b）| 0（相等）| 正数（a>b）→ max 就靠这个返回的正负号判断谁大
```

### Optional 就是"可能没有值的盒子"

> 📖 **Optional\<T\> 是什么**：一个**容器**，里面可能有值，也可能是空的。它存在的意义是：**把"可能为 null"这个风险显式地告诉你**，逼你用安全的方式取值，从根上消灭空指针。

```java
List<Integer> nums  = Arrays.asList(3, 9, 1, 6);
List<Integer> empty = new ArrayList<>();

// 终止操作 max 返回 Optional：可能没有最大值
Optional<Integer> max1 = nums.stream().max(Integer::compareTo);   // 有值
Optional<Integer> max2 = empty.stream().max(Integer::compareTo);  // 空

System.out.println(max1.orElse(-1));   // 9（有值 → 取出来）
System.out.println(max2.orElse(-1));   // -1（没值 → 用兜底值，不空指针）

// 其他常用方法
max1.isPresent();            // true（有没有值）
max1.get();                  // 9（直接取，但空时抛 NoSuchElementException，慎用）
max1.orElseThrow();          // 没值就抛异常（用于"必须有"的业务场景）
```

> ⚠️ **orElse vs orElseGet 的区别（面试可能问）**：
>
> - `orElse(默认值)`：无论有没有值，默认值**都已提前算好**（哪怕没用上）
> - `orElseGet(Supplier)`：**只有没值时**才去执行 Supplier 生产默认值（惰性）
>
> ```java
> String a = opt.orElse(computeHeavy());          // computeHeavy() 一定执行
> String b = opt.orElseGet(() -> computeHeavy()); // 有值就不执行 computeHeavy()
> ```
>
> 区别在于 orElse 是在取值前固定执行 computeHeavy，如果有值就返回原值，没有就返回函数结果；而 orElseGet 是如果有值那么就不会执行 computeHeavy，直接返回原值，没有值才现场执行，这样相较 orElse 少了一次多余的运算。

#### 生产 Optional 的三种方式

```java
Optional.of(s)          // s 不能为 null
Optional.ofNullable(s)  // s 可以为 null
Optional.empty()        // 创造一个空盒子

// 这里的 map.get() 是 hashmap 里的，查找括号里的键对应的值，并非 stream 和 optional 里的 map
Optional<String> box = Optional.ofNullable(map.get("不存在的值"));
System.out.println(box.orElse("默认名字"));
```

#### Optional 中的 map 函数

```text
盒子.map(函数)
  = 盒子里有值 → 用函数加工这个值 → 把结果装回新盒子
  = 盒子里没值 → 直接返回空盒子（函数压根不执行）

关键：`map` 返回的还是 Optional（盒子），不是加工后的裸值。
所以可以一直 .map().map().map() 链下去，最后再用 orElse 开盒。
```

```java
Optional<String> name = Optional.ofNullable(map.get("name"));  // 可能空

String result = name
        .map(String::trim)            // 第1步：去空格（有值才做）
        .map(String::toUpperCase)     // 第2步：转大写（有值才做）
        .orElse("默认名字");           // 收尾：哪一步空了都用兜底
```

中间任何一步发现盒子是空的，后面的 map 就全"躺平"跳过，最后直接走 `orElse`。

> 💡 记住口诀：**能不用 `if (x != null)` 就别用**。`Optional` + `orElse` / `map` 能让你写出的代码没有空指针隐患。第 25 章 Spring Boot、MyBatis 里会频繁见到它。

### 终止操作：真正干活

#### collect：收集成集合（最常用）

```java
Set<Integer> set = nums.stream().collect(Collectors.toSet());    // 收集成 Set（去重）

String joined = words.stream().collect(Collectors.joining(", "));  // 连接成字符串
System.out.println(joined);   // "java, python, go"

// JDK 16+ 更简单：Stream.toList()，不用写 Collectors
List<Integer> list2 = nums.stream().filter(n -> n % 2 == 0).toList();
```

> 📖 **Collectors** 是 `java.util.stream` 包里的静态工具类，专门配合 `collect` 用。除了 `toList`、`toSet`、`joining`，还有 `groupingBy`（分组）、`summingInt`（求和）、`counting`（计数）等。JDK 16 之后 `stream.toList()` 直接返回不可变 List，日常够用。

#### count / forEach

```java
long count = nums.stream().filter(n -> n > 3).count();   // count 计数
nums.stream().filter(n -> n > 3).forEach(System.out::println);   // 对每一个都执行
```

#### reduce：聚合归约

```java
int sum = nums.stream().reduce(0, (a, b) -> a + b);
```

现在假如 nums = {1,2,3,4,5,6}，那么：

```text
1. a=0;      b=1;  a+b=1
2. a=第一步中的 a+b=1； b=2; a+b=3
3. 以此类推……

reduce(初始值, (累积结果, 当前元素) -> 新的累积结果)
```

> 注意：这个函数的两个参数**不对称**——`a` 是"之前滚出来的累积结果"，`b` 才是"流里刚拿出来的元素"。不是随便加两个数，是"**累积 + 新元素**"。

```java
// 求最大：累积 = 上一步里更大的那个
int max = nums.stream().reduce(Integer.MIN_VALUE,
        (acc, n) -> n > acc ? n : acc);

// 拼字符串：累积 = 之前拼好的串 + 逗号 + 新词
String joined = words.stream().reduce("",
        (acc, w) -> acc.isEmpty() ? w : acc + "," + w);
```

**reduce 是个通用的"累积器"**，加、乘、取大、拼接……只要是"两个东西合成一个"的规律，都能灌进去。

```java
// 不写初始值：第一个元素直接当"累积起点"
Optional<Integer> sum = nums.stream().reduce((a, b) -> a + b);

// 但空流怎么办？没有初始值 = 没有累积起点 → 结果不存在 → 返回 Optional！
int result = sum.orElse(0);   // 空流 → 0
```

#### mapToInt：转成"数字流"，数学方法全解锁

```java
nums.stream().mapToInt(n -> n)   // Stream<Integer> → IntStream（里面的元素变成 int 基本类型）
             .sum();             // IntStream 有 sum()、average()、max()、min()、count()

// 原来要写的：reduce 自己滚
int sum = nums.stream().reduce(0, (a, b) -> a + b);      // 麻烦

// mapToInt 后：现成的，一行
int sum = nums.stream().mapToInt(n -> n).sum();          // 简单
```

```java
List<Student> students = ...;

// 从每个 Student 对象里抠出 score 字段 → 变成 IntStream
students.stream()
        .mapToInt(Student::getScore)   // 方法引用：学生 -> 他的分数
        .average()                     // 有 average()、sum()、max()...
        .orElse(0);                    // 空流没平均值 → OptionalDouble → 兜底
```

**两个易错点：**

1. **`average()` 返回 `OptionalDouble`，不是 `double`**：空流没有平均值 → 又是 Optional 家族 → 必须 `orElse(0)` 兜底。
2. **`mapToInt` 是"转类型"，`map` 是"换对象"**：`map(x -> x + 1)` 返回的仍是 `Stream`，`mapToInt(x -> x)` 返回的是 `IntStream`。区别就在返回类型——前者还是对象流，后者才是数字流。

> 一句话：**`mapToInt` = 把"对象流"改成"数字流"，解锁 `sum`/`average`/`max` 这些现成方法**，相当于把 C++ 里 `vector<Student>` 先变成 `vector<int>` 再算。

#### 高级收集：groupingBy 分组

```java
// 按分数段分组：优秀 / 及格 / 不及格 → Map<分组key, List<学生>>
Map<String, List<Student>> group = students.stream().collect(Collectors.groupingBy(
    s -> s.getScore() >= 90 ? "优秀" : (s.getScore() >= 60 ? "及格" : "不及格")
));

// 分组 + 统计每组人数
Map<String, Long> countByGroup = students.stream()
        .collect(Collectors.groupingBy(s -> s.getScore() >= 60 ? "及格" : "不及格",
                                       Collectors.counting()));
System.out.println(countByGroup);   // {及格=8, 不及格=2}
```

---

## JVM 基础

### 引入：Java 为什么能"一次编译，到处运行"

> 📖 **什么是 JVM**：Java Virtual Machine，**Java 虚拟机**。它是"运行 .class 字节码的程序"。不同平台有不同版本的 JVM，但面对的都是同一份 .class。所以"一次编译、到处运行"的本质是：**平台差异被 JVM 挡住了**。

#### JVM 到底干什么

> 💡 一句话：**JVM = 平台无关执行 + 自动内存管理 + 垃圾回收**。对比 C 里 `malloc`/`free` 全是手动，Java 把"内存怎么管"从你手里接管了，代价是 GC 会占用一点运行时间。

### JVM 运行时内存结构（重点）

#### 五个区域总览

```text
JVM 运行时内存（Data Area）
├── 程序计数器（PC 寄存器）    —— 每个线程一个，记录"执行到第几条指令"
├── 虚拟机栈（JVM Stack）      —— 每个线程一个，存"方法调用时的局部变量"★
├── 本地方法栈                —— 每个线程一个，供 native 方法用（了解）
├── 堆（Heap）               —— 所有线程共享，存 new 出来的对象 ★★最大
└── 方法区（元空间 Metaspace）—— 所有线程共享，存类信息、静态变量、常量 ★
```

方法里的局部变量是存在栈里，new 出来的对象存在堆里。

#### 栈（虚拟机栈）——方法的调用现场

每调用一个方法就会压入一个栈帧，所谓栈溢出就是压入栈过多，我们在定义局部变量时，是将栈帧存在当前类里，方法结束就弹出。

```java
int a = 1;              // main 的局部变量 a，存在 main 的栈帧里
print(a);               // 调用 print → 压入 print 的栈帧
```

#### 与 C 的内存布局对照（务必看懂这张表）

| 项目 | C 进程内存 | JVM 内存 | 存什么 |
| --- | --- | --- | --- |
| 局部变量 / 调用现场 | 栈段 | 虚拟机栈 | 方法参数、局部变量 |
| 动态分配的对象 | 堆段（malloc/free 手动管） | 堆（GC 自动管） | new 的对象 |
| 全局 / 静态数据 | 数据段（.data/.bss） | 方法区（含静态变量） | 静态变量、常量 |
| 函数代码 | 代码段（.text） | 方法区 | 类信息、方法字节码 |
| 字符串字面量 | 只读数据段 | 常量池 / 堆 | "hello" 这样的字面量 |

> 💡 对照结论：**Java 的"堆" ≈ C 的"堆段"，Java 的"虚拟机栈" ≈ C 的"栈段"，Java 的"方法区" ≈ C 的"数据段+代码段"**。最大的不同：C 的堆要你 `free`，Java 的堆由 GC 自动回收。

#### 堆（Heap）的内部划分：新生代 + 老年代

堆分了两代，一代新生代，一代老年代。所谓新生代又分为 Eden 区以及 S0、S1。Eden 区就是存新 new 的对象，S0、S1 就是幸存者区，活对象存储在这。老年代就是放"多次垃圾回收都没死"的对象。

> 📖 为什么分代？经验统计：**绝大多数对象都是"朝生夕灭"**（比如 for 循环里临时 new 的对象）。把堆分成新生代、老年代，就可以"区别对待"：新生代死得快、回收频繁，老年代活得久、少回收。这就是"分代回收"的由来。

### 垃圾回收（GC）：Java 帮你自动 free

#### 怎么判断"没人要"：可达性分析

从 GC Roots（根对象）开始遍历，沿引用一直走，没走过的变量就标记为垃圾。

```java
Student s = new Student("小明");   // ① new 的对象，s 引用它
s = null;                          // ② 引用断掉 → 小明对象"不可达" → 成垃圾
```

**GC Roots 通常包括**：虚拟机栈里引用的对象、静态变量引用的对象、常量引用的对象。

**两种方法对比：**

1. 计数法，如果我们遍历到一次对象的引用就 count++，计数为 0 就是为垃圾。缺点：如果出现两个对象相互引用（循环引用），那么计数永远不为 0，导致数据泄露。
2. GC 遍历法，解决循环问题。

#### 三种基本回收算法

1. **标记-清理**：在 GC 遍历之后，将所有标记出来的垃圾回收。缺点：会导致内存碎片，空间不连续。
2. **标记-复制**：将活对象复制之后放在别的空间，然后再把原本区域清空。缺点：浪费其他空间。
3. **标记-整理**：标记后将所有活对象往一端移动。缺点：移动成本高。

> 📖 它们不是"三选一"，而是**分代配合**：新生代对象死得快，用"复制"高效；老年代对象死得慢，用"标记-整理"省空间。

#### 分代回收流程（一张图看懂）

```text
1. new 的对象 → Eden 区
2. Eden 满了 → 触发 Minor GC（新生代回收）：
    活着的对象 → S0；下次 → S1（两个幸存区来回倒）
3. 对象熬过 15 次回收还没死 → 晋升到老年代
4. 老年代满了 → Major GC / Full GC（回收整个堆，停顿更久）
```

> 💡 常问："一个对象从生到死经历了什么？" 答：**Eden → 幸存区（S0/S1 交替）→ 老年代**，中途被回收就结束。绝大多数对象"早夭"在 Eden 的 Minor GC。

#### 什么时候触发类加载

类在**第一次被主动使用**时才加载：

- `new` 一个对象
- 调用类的静态方法
- 访问类的静态变量
- 用反射 `Class.forName(...)`
- 初始化它的子类时（父类会先加载）

> 📖 这就是"懒加载"：用到才加载。所以 JVM 启动不是把项目里所有类都读进来，而是用到哪个类加载哪个。

### JVM 调优参数（了解，会用命令行)

#### 堆内存设置

```bash
# -Xms：初始堆大小   -Xmx：最大堆大小（生产上通常设成一样，避免扩容抖动）
java -Xms256m -Xmx1024m -jar myapp.jar

# 堆满了且无法回收 → OutOfMemoryError
java -Xmx100m OOMDemo

# -Xss：设置每个线程栈的大小（了解即可，默认 1M 左右）
java -Xss512k MyApp
```

#### 打印 GC 日志

```bash
java -verbose:gc -jar myapp.jar

# 输出形如：
# [GC (Allocation Failure)  65536K->1344K(251392K), 0.002秒]
# 65536K 是回收前占用的堆，1344K 是回收后，251392K 是堆总大小
```

> 💡 看日志判断内存泄漏：回收后占用如果持续上升、几乎不下降 → 可能有对象一直被引用，GC 收不掉。

#### 观察堆内存变化（命令行 / 可视化二选一）

```bash
# 方式 A：命令行。运行一个带循环的程序，用 jcmd 看堆占用
# （jcmd 是 JDK 自带的诊断工具，和 javac 一起在 JDK 的 bin 目录）
jcmd <进程号> GC.heap_info

# 方式 B：可视化。JDK 自带 jconsole，双击启动后选你的 Java 进程
# 图形界面里能看到"堆内存"曲线：新生代、老年代各自占用
jconsole
```

> 💡 建议：把 OOMDemo 用 `-Xmx200m` 跑起来，同时开 `jconsole`，能看到 Eden 被不断填满、GC 反复腾挪，直到最终 OOM。看完这个，你对"分代回收"的印象会非常深刻。

### 本章易错点清单

| # | 易错点 | 说明 |
| --- | --- | --- |
| 1 | 以为堆存所有数据 | 局部变量在栈，静态变量在方法区，new 的对象才在堆 |
| 2 | 以为 System.gc() 立刻回收 | 只是"建议"，JVM 可忽略 |
| 3 | 分不清引用计数和可达性分析 | JVM 用可达性分析，能解决循环引用 |
| 4 | 混淆 Minor GC / Full GC | Minor 只清新生代，Full 清整个堆（停顿更长） |
| 5 | 类加载时机 | 第一次被主动使用才加载，不是启动就全加载 |
| 6 | 裸跑 OOM 演示 | 必须加 -Xmx100m，否则可能影响电脑其他程序 |

---

## MySQL 基础

### 为什么要学数据库

#### 你以前是怎么存数据的？

写 C 程序的时候，你一定存过数据：

```c
struct Student {               // 一行"记录"的结构
    int id;
    char name[32];
    double score;
};

struct Student students[100];  // 一整张"表"
```

然后自己写循环查找、自己写文件读写、自己处理各种边界情况。一个人玩没问题，可一旦认真起来，痛点一堆：

- **文件格式是自己发明的**，换台机器、换个程序就解析不了
- **查找、排序、统计全要手写**：查一个分数大于 90 的学生，得自己 for 循环遍历
- **多程序共享数据是灾难**：两个进程同时往一个文件里写，数据就乱了
- **数据量一大就卡死**：几千行勉强能跑，几十万行性能直接崩

#### 数据库解决什么问题

**数据库（Database）就是专门管数据的"管家"**。你不再自己写存取逻辑，只用一句 SQL 告诉它"我要什么"，它自己搞定怎么存、怎么找、怎么保证安全。

| 对比项 | C 程序 + 文件 | 数据库（MySQL） |
| --- | --- | --- |
| 存储方式 | 自己定义文件格式 | 二维表（表格） |
| 查找 | 自己写循环遍历 | `SELECT ... WHERE` |
| 排序 | 自己写 qsort / 冒泡 | `ORDER BY` |
| 统计 | 自己写累加循环 | `COUNT / SUM / AVG` |
| 并发安全 | 基本没有 | 内置事务和锁 |
| 多程序共享 | 很难 | 天然支持 |

> 💡 一句话：**数据库 = 一套现成的、健壮的"数据结构 + 文件系统 + 并发控制"**。你只管提需求（SQL），实现交给它。

### 1.3 MySQL 是什么



MySQL 是**关系型数据库**（Relational Database），"关系"指"表与表之间的关联"。数据以**二维表**组织：



```

student 表

| id | name | age | score |

|----|------|-----|-------|

| 1  | 小明 | 20  | 90.5  |

| 2  | 小红 | 19  | 85.0  |

```

## 2. 数据库与表的基本操作



### 2.1 数据类型（和 C 对照着记）



| MySQL 类型 | 相当于 C | 说明 |

|-----------|---------|------|

| `INT` | `int` | 整数 |

| `BIGINT` | `long long` | 大整数 |

| `DOUBLE` | `double` | 浮点数 |

| `DECIMAL(10,2)` | - | 定点小数，**算钱用，不丢精度** |

| `VARCHAR(n)` | `char[n]` | 可变长度字符串，最多 n 个字符 |

| `TEXT` | - | 大段文本（文章正文） |

| `DATETIME` | - | 日期时间，如 `2026-08-06 12:00:00` |



> 💡 两个最容易踩的坑：**钱永远用 `DECIMAL` 不用 `DOUBLE`**（浮点数有精度误差，0.1+0.2 对不上）；**字符串用 `VARCHAR`**（`CHAR` 定长会浪费空间）。

### 2.2 建库、选库



```sql

-- 建库：utf8mb4 支持中文和 emoji，不要再用老式 utf8

CREATE DATABASE student_db DEFAULT CHARACTER SET utf8mb4;



-- 查看所有数据库

SHOW DATABASES;



-- 告诉 MySQL：后面操作都在这个库里做

USE student_db;

```
