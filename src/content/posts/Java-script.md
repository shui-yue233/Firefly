---
title: "Java script"
published: 2026-10-15
tags: ["js"]
category: "学习笔记"
draft: false
lang: ""
---

对于所有的js，我们都是要写在<script></script>中间的
而对于<script></script>的数量以及位置，并没有限制，既可以写到head，body，也可以写到外面，但是基本上没有其他特定要求我们都写body内部的最下面，这样能防止对js编译的时间太久导致页面加载不出来

# 数据类型与变量，输出
js是弱类型语言。
对于数据类型，我们基本就只是使用const，let。当然还有其他，比如var
tip:const与其他语言一样，不能修改。
至于输出：
1.alert()，是在url下方出现一个提示框，输出内容
2.console log(),是在界面控制台输出，按f12即可
3.doucument.write(),是在界面body区域输出  (不常用)
4.- 使用 **innerHTML** 写入到 HTML 元素。

如需从 JavaScript 访问某个 HTML 元素，可以使用 document.getElementById(_id_) 方法。
**document.getElementById("demo")** 是使用 id 属性来查找 HTML 元素的 JavaScript 代码 。
**innerHTML = "段落已修改。"** 是用于修改元素的 HTML 内容(innerHTML)的 JavaScript 代码。

<p id="demo">我的第一个段落</p>

<script>
document.getElementById("demo").innerHTML = "段落已修改。";
</script>

那么界面输出的就只有"段落已修改"了

## 数据类型

1.number:整数，小数，NaN（Not a Number)
2.boolean:布尔类型
3.string:字符串，可以用"",'',``,三种
4.undefined：在变量未被初始化前，其数据类型都是undefined
5.null：对象为空(用typeof的结果是object)
tip:由于js对大小写敏感，所以我们的null，Null，NULL都是不同的

如果我们想看变量的数据类型，可以用alert(typeof xxx)
tip:由``括起来的字符串是模板字符串，我们可以用 ${变量名} 来进行字符串拼接的简化
let a='elaina';
let age=16;
ex:       alert("字符串"+a+"的拼接"+age)
      alert(`字符串${a}的拼接${age}`)

**typeof [1,2,3,4] 返回 "object"**，这是 JavaScript 早期设计的一个"缺陷"，数组本质上是特殊类型的对象。

正确检测数组的方法：
Array.isArray([1,2,3]); // true
[1,2,3] instanceof Array; // true

### JavaScript 数组

下面的代码创建名为 cars 的数组：

var cars=new Array();
cars[0]="Saab";
cars[1]="Volvo";
cars[2]="BMW";

或者 (condensed array):

var cars=new Array("Saab","Volvo","BMW");

或者 (literal array):

var cars=["Saab","Volvo","BMW"];

# JavaScript 对象

对象由花括号分隔。在括号内部，对象的属性以名称和值对的形式 (name : value) 来定义。属性由逗号分隔：

var person={firstname:"John", lastname:"Doe", id:5566};

上面例子中的对象 (person) 有三个属性：firstname、lastname 以及 id。

空格和折行无关紧要。声明可横跨多行：

var person={
firstname : "John",
lastname  : "Doe",
id        :  5566
};

对象属性有两种寻址方式：

name=person.lastname;
name=person["lastname"];

## 对象属性

可以说 "JavaScript 对象是变量的容器"。

但是，我们通常认为 "JavaScript 对象是键值对的容器"。

键值对通常写法为 **name : value** (键与值以冒号分割)。

键值对在 JavaScript 对象通常称为 **对象属性**。

|                                                 |                        |
| ----------------------------------------------- | ---------------------- |
| ![Note](https://www.runoob.com/images/lamp.jpg) | JavaScript 对象是属性变量的容器。 |

## 对象方法

对象的方法定义了一个函数，并作为对象的属性存储。

对象方法通过添加 () 调用 (作为一个函数)。

该实例访问了 person 对象的 fullName() 方法:

person.fullName();
person.fullName;
这两个是不一样的，一个方法，一个属性。

通常 fullName() 是作为 person 对象的一个方法， fullName 是作为一个属性。

如果使用 fullName 属性，不添加 **()**, 它会返回函数的定义：

method : function(){

                document.getElementById("demo_02").innerHTML = "I love ArkNights";

                return "miHoYo"

            }

person.fullName()：I love ArkNights(控制台输出miHoYo)
person.fullName:     function{doucument.get.........}

# 声明变量类型

当您声明新变量时，可以使用关键词 "new" 来声明其类型：

var carname=new String;
var x=      new Number;
var y=      new Boolean;
var cars=   new Array;
var person= new Object;

# js语句

## Javacript 语句标识符

JavaScript 语句通常以一个 **语句标识符** 为开始，并执行该语句。

语句标识符是保留关键字不能作为变量名使用。

下表列出了 JavaScript 语句标识符 (关键字) ：

|语句|描述|
|---|---|
|break|用于跳出循环。|
|catch|语句块，在 try 语句块执行出错时执行 catch 语句块。|
|continue|跳过循环中的一个迭代。|
|do ... while|执行一个语句块，在条件语句为 true 时继续执行该语句块。|
|for|在条件语句为 true 时，可以将代码块执行指定的次数。|
|for ... in|用于遍历数组或者对象的属性（对数组或者对象的属性进行循环操作）。|
|function|定义一个函数|
|if ... else|用于基于不同的条件来执行不同的动作。|
|return|返回结果，并退出函数|
|switch|用于基于不同的条件来执行不同的动作。|
|throw|抛出（生成）错误 。|
|try|实现错误处理，与 catch 一同使用。|
|var|声明一个变量。|
|while|当条件语句为 true 时，执行语句块。|

对于for......in语句，可以应用于三种情形
1.遍历对象属性：
const person = {
	name : "elaina";
	age:"16";
	gender:"female";
}
for(let i in person){
	console.log(i+":"+person[i]);
}

输出结果：
name:elaina
age:16
gender:female

2.遍历数组
const arr = {"elaina","roxy","megumi"};
for(let i in arr){
	console.log(i+":"+arr[i]);
}

输出结果：
0:elaina
1:roxy
2:megumi

3.遍历嵌套对象属性
const person={
	name:"elaina";
	info:{
		hobby:"sleep";
		mail-address:"11111@qq.com";
	}
}

输出结果：
name：elaina
info: object(这个是下拉式的，点开就会显示hobby和mail-address内容)

# js函数

## 调用带参数的函数

在调用函数时，可以向其传递值，这些值被称为参数。

这些参数可以在函数中使用。

可以发送任意多的参数，由逗号 (,) 分隔：

myFunction(_argument1,argument2_)

当您声明函数时，请把参数作为变量来声明：

function myFunction(_let1_,_let2_)
{
_代码_
}

变量和参数必须以一致的顺序出现。第一个变量就是第一个被传递的参数的给定的值，以此类推。

即使不把它保存为变量，也可以使用返回值：

document.getElementById("demo").innerHTML=myFunction();

"demo" 元素的 innerHTML 将成为 5，也就是函数 "myFunction()" 所返回的值。

在仅仅希望退出函数时 ，也可使用 return 语句。返回值是可选的：

function myFunction(a,b) { if (a>b) { return; } x=a+b }

如果 a 大于 b，则上面的代码将退出函数，并不会计算 a 和 b 的总和。

## 向未声明的 JavaScript 变量分配值

如果把值赋给尚未声明的变量，该变量将被自动作为 window 的一个属性。

这条语句：

carname="Volvo";

将声明 window 的一个属性 carname。

非严格模式下给未声明变量赋值创建的全局变量，是全局对象的可配置属性，可以删除。

let  x="elaina marry me";

        delete(x);

        console.log(x);   //还是输出x内容

        y="elaina";

        console.log(y);   //elaina

        delete(y);        //true

        console.log(y);   //由于变量删除而报错

# JavaScript 作用域

## JavaScript 变量生命周期

JavaScript 变量生命周期在它声明时初始化。

局部变量在函数执行完毕后销毁。

全局变量在页面关闭后销毁。

## HTML 中的全局变量

在 HTML 中, 全局变量是 window 对象，所以 window 对象可以调用函数内的未声明（未加 var)的局部变量。

**注意：**所有全局变量都属于 window 对象。

//此处可使用 window.carName
alert(window.carName);

function myFunction() {
	carName = "Volvo";
}

# JavaScript 事件

## HTML 事件

HTML 事件可以是浏览器行为，也可以是用户行为。

以下是 HTML 事件的实例：

- HTML 页面完成加载
- HTML input 字段改变时
- HTML 按钮被点击

通常，当事件发生时，你可以做些事情。

在事件触发时 JavaScript 可以执行一些代码。

HTML 元素中可以添加事件属性，使用 JavaScript 代码来添加 HTML 元素。

单双引号无所谓
<some-HTML-element some-event="JavaScript 代码">
<button onclick = "document.getElementById(demo).InnerHTML=....."></button>

## 常见的HTML事件

下面是一些常见的HTML事件的列表:

|事件|描述|
|---|---|
|onchange|HTML 元素改变|
|onclick|用户点击 HTML 元素|
|onmouseover|鼠标指针移动到指定的元素上时发生|
|onmouseout|用户从一个 HTML 元素上移开鼠标时发生|
|onkeydown|用户按下键盘按键|
|onload|浏览器已完成页面的加载|

更多事件列表: [JavaScript 参考手册 - HTML DOM 事件](https://www.runoob.com/jsref/dom-obj-event.html)。

## JavaScript 字符串

可以在字符串中使用引号，字符串中的引号不要与字符串的引号相同:

var answer = "It's alright";
var answer = "He is called 'Johnny'";
var answer = 'He is called "Johnny"';

也可以在字符串添加转义字符来使用引号：

var x = 'It\'s alright';
var y = "He is called \"Johnny\"";

## 字符串长度

可以使用内置属性 **length** 来计算字符串的长度：

## 实例

var txt = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var sln = txt.length;

var x = "John";             
var y = new String("John");
(x === y) // 结果为 false，因为 x 是字符串，y 是对象

=== 为绝对相等，即数据类型与值都必须相等。

# JavaScript 模板字符串

let text = `He's often called "Runoob"`;
最后结果会保留单引号和双引号的
