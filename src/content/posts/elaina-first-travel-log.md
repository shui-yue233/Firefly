---
title: "elaina的Java Code旅行日志"
published: 2026-08-04
description: ''
image: './images/first-post.jpg'
tags: [code, 学习过程]
category: 生活
draft: false

lang: ''
---


### 关于集合的各种方法
"hello.txt".[[startsWith]]("he");  // true   以什么开头
"hello.txt".endsWith(".txt");  // true   以什么结尾
"hello.txt".contains("llo");   // true   包含什么（任意位置）
"hello.txt".equals("hello");   // false  完全相等



list.remove("B");            // 只删第一个 "B"
list[[.removeAll]](toRemove);    // 把所有 toRemove 里有的元素全删
list.retainAll(set);   // 反着来：只保留 set 里有的（求交集）
list.removeAll(set);   // 删掉 set 里有的（求差集）
list.clear();          // 全清空


|方法|做什么|返回|会不会移动指针|
|---|---|---|---|
|`it.hasNext()`|只**检查**后面还有没有元素|`true` / `false`|**不会**|
|`it.next()`|**移动**到下一个元素，并返回它|元素本身|**会**|
`split(" ")` 是 String 的方法：**用括号里的分隔符，把字符串切成一段段的数组**。


### 关于统计map中出现次数写法：
for (String word : text.split(" ")) {

    count.put(word, count.getOrDefault(word, 0) + 1);

}





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