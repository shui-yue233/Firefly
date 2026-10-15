---
title: "MySQL基础"
published: 2026-10-15
tags: ["数据库"]
category: "学习笔记"
draft: false
lang: ""
---

# SQL
在终端内打开mysql:
mysql -u root -p;

当想对某个数据库操作时，记得先use:
use 数据库名

展示所有数据库：
show databases;

在use更改数据库后，可以show查表：
show table 表名；

数据类型：
INT：可分为TINYINT，SMALLINT，MEDIUM....,BIG....
BLOB:二进制的数据，TINY...,MEDIUM...,LONG...
TEXT:文本数据，同样有分类

### DQL编写顺序

select
	字段列表
from
	表名
where
	条件
group by
	分组字段列表
having
	分组后条件列表
order by
	排序字段列表 (asc/desc/自定义)
limit
	分页参数

### DQL执行顺序

from->where->group by->having->select->order by->limit

### DCL

tip:此处user时mysql数据库中的表名

查询用户：
use mysql;
select * from user;

创建用户：
create user "用户名"@"主机名"  identified by "密码"
如果用%就是任意主机都可
alter user "用户名"@"主机名" identified with my_native_password by "新密码"
drop user "用户名"@"主机名"

赋予权限
grant  权限类型(usage.....注意，all是指所有权限)  on  数据库.表名  to  "用户名"@"主机"
撤回权限
revoke 权限类型 on  数据库.表名 to "用户名"@"主机"
# 函数

## 字符函数
upper(),lower()大小写转变
concat(s1,s2)字符串拼接
lpad(str,数目,补全的字符)
rpad同理，l左补齐，r右补齐
substring(str,起始位置,结束位置)
	tips:mysql中的substring的起始位置是从1开始

## 数值函数

ceil(),floor()向上向下取整
round(x,y)对x四舍五入，保留y位小数
mod(x,y)即x%y
rand()，0到1中的随机数，一般都是乘以所需要位数使用

## 时间函数
curdate(),curtime()一个是日期，一个是时间
now()当前日期和时间
date(x),month(x),year(x):括号中x指的是日期和时间

date_add(x,data):x是当前日期，data是我们想要加上的值
tips:我们在写data时，要加上interval关键词，然后是数值与时间单位，例如：interval 70 day;

datediff(date1,date2)
求差函数，计算两个日期之间的差值

tips:对datediff()和date_add()函数来说，我们可以的数值可以为负数，add可以加上负数就是往前推算日期，diff结果是负数的话说明我们的date1小于date2

select name,datediff(curdate(),entry_date) as entry_dates from tb_user order by entry_dates desc
