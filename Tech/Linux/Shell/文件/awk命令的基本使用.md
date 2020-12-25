## 命令简介

Awk  pattern scanning and processing language，对文本和数据进行处理。

awk 是一种编程语言，用于在linux/unix下对文本和数据进行处理。数据可以来自标准输(stdin)、一个或多个文件，或其它命令的输出。它在命令行中使用，但更多是作为脚本来使用。awk有很多内建的功能，比如数组、函数等，这是它和C语言的相同之处，灵活性是awk最大的优势。

## 语法格式

``` BASH
awk [options] 'scripts' var=value filename
```

## 常用参数

``` BASH
-F 指定分隔符（可以是字符串或正则表达式）
-f 从脚本文件中读取awk命令
-v var=value 赋值变量，将外部变量传递给awk
```

## 脚本基本结构

``` BASH
awk 'BEGIN{ print "start" } pattern{ commands } END{ print "end" }' filename
```

一个awk脚本通常由BEGIN语句+模式匹配+END语句三部分组成, 这三部分都是可选项.

工作原理:

* 第一步执行BEGIN 语句
* 第二步从文件或标准输入读取一行，然后再执行pattern语句，逐行扫描文件到文件全部被读取
* 第三步执行END语句

实例展示:

``` BASH
echo "hello " | awk 'BEGIN{ print "welcome" } END{ print "2017-08-08" }'
welcome
2017-08-08
echo -e "hello" | awk 'BEGIN{ print "welcome" } {print} END{ print "2017-08-08" }'
welcome
hello
2017-08-08
#不加print参数时默认只打印当前的行
echo|awk '{ a="hello"; b="nihao"; c="mingongge"; print a,b,c; }'
hello nihao mingongge
#使用print以逗号分隔时，打印则是以空格分界
echo|awk '{ a="mgg"; b="mingg"; c="mingongge"; print a" is "b" or "c; }'
mgg is mingg or mingongge
#awk的print语句中双引号其实就是个拼接作用
```

## Awk的变量

### 内置变量

``` BASH
$0   #当前记录
$1~$n #当前记录的第N个字段
FS   #输入字段分隔符（-F相同作用）默认空格
RS   #输入记录分割符，默认换行符
NF   #字段个数就是列 
NR   #记录数，就是行号，默认从1开始
OFS  #输出字段分隔符，默认空格
ORS  #输出记录分割符，默认换行符 
```

外部变量

``` BASH
[mingongge@ ~]#a=100
[mingongge@ ~]#b=100
[mingongge@ ~]#echo |awk '{print v1*v2 }' v1=$a v2=$b
10000
```

## Awk运算与判断

### 算术运算符

``` BASH
+ - 加减
* / & 乘 除 求余
^ *  求幂
++ -- 增加或减少，作为前缀或后缀
```

``` BASH
[mingongge@ ~]#awk 'BEGIN{a="b";print a,a++,a--,++a;}'
b 0 1 1
[mingongge@ ~]#awk 'BEGIN{a="0";print a,a++,a--,++a;}'
0 0 1 1
[mingongge@ ~]#awk 'BEGIN{a="0";print a,a++,--a,++a;}'
0 0 0 1
#和其它编程语言一样，所有用作算术运算符进行操作，操作数自动转为数值，所有非数值都变为0
```

### 赋值运算符

``` BASH
= += -= *= /= %= ^= **=
```

### 正则运算符

``` BASH
~ !~  匹配正则表达式/不匹配正则表达式
```

### 逻辑运算符

``` BASH
||  &&  逻辑或  逻辑与
```

### 关系运算符

``` BASH
< <= > >= != = 
```

### 其它运算符

``` BASH
$   字段引用 
空格 字符串链接符
?:   三目运算符
ln   数组中是否存在某键值
```

## Awk正则

``` BASH
^    行首定位符
$    行尾定位符
.    匹配任意单个字符
*    匹配0个或多个前导字符（包括回车）
+    匹配1个或多个前导字符
?    匹配0个或1个前导字符 
[]   匹配指定字符组内的任意一个字符/^[ab]
[^]  匹配不在指定字符组内的任意一个字符
()   子表达式
|    或者
    转义符
~,!~ 匹配或不匹配的条件语句
x{m} x字符重复m次
x{m,} x字符至少重复m次
X{m,n} x字符至少重复m次但不起过n次（需指定参数-posix或--re-interval）
```

## Awk实例介绍

``` BASH
awk –F : ‘{print $2}’ datafile
#以:分隔打印第二列
awk –F : ‘/^Dan/{print $2}’ datafile
#以:分隔打印以Dan开头行的第二列内容
awk –F : ‘/^[CE]/{print $1}’ datafile 
#打印以C或E开头行的第一列
awk –F : ‘{if(length($1) == 4) print $1}’ datafile 
#打印以:分隔且长度为4字符的第一列内容
awk –F : ‘/[916]/{print $1}’ datafile
#匹配916的行以:分隔打印第一列
awk -F : '/^Vinh/{print "a"$5}' 2.txt
#显示以Dan开头行并在第五列前加上a
awk –F : ‘{print $2”,”$1}’  datafile
#打印第二列第一列并以,分隔
awk -F : '($5 == 68900) {print $1}' 2.txt
#以:分隔打印第五列是68900的行第一列 
awk -F : '{if(length($1) == 11) print $1}' 2.txt
#打印以:分隔且长度为4字符的第一列内容
awk -F : '$1~/Tommy Savage/ {print $5}' 2.txt
awk -F : '($1 == "Tommy Savage") {print $5}' 2.txt
#打印以:分隔且第一列为Tommy Savage的第五列内容
ll |awk 'BEGIN {size=0;} {size=size+$5;} END{print "[end]size is ",size}'
#统计目录个的文件所有的字节数
awk 'BEGIN{size=0;} {size=size+$5;} END{print "[end]size is ",size/1024/1024,"M"}' 
#以M为单位显示目录下的所有字节数
awk 'BEGIN{a=10;a+=10;print a}'
20 
#a+10等价于 a=a+10
echo|awk 'BEGIN{a="100testaaa"}a~/test/{print "ok"}' 
#正则匹配a 是否有test字符，成立打印ok
awk 'BEGIN{a="b";print a=="b"?"ok":"err"}'
ok
awk 'BEGIN{a="b";print a=="c"?"ok":"err"}'
err
#三目运算符?:
awk '/root/{print $0}' passwd 
#匹配所有包含root的行
awk -F: '$5~/root/{print $0}' passwd 
# 以分号作为分隔符，匹配第5个字段是root的行
ifconfig eth0|awk 'BEGIN{FS="[[:space:]:]+"} NR==2{print $4}'
#打印IP地址
awk '{print toupper($0)}' test.txt
#toupper是awk内置函数，将所小写字母转换成大写
```
