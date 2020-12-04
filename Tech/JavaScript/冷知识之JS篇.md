# 冷知识之JS篇

## 浮点数快速向下取整

JavaScript中是没有整型概念的，但利用好位操作符可以轻松处理，同时获得效率上的提升。

<br>

|0和~~是很好的一个例子，使用这两者可以将浮点转成整型且效率方面要比同类的parseInt,Math.round 要快。在处理像素及动画位移等效果的时候会很有用。


```JavaScript
(12.4 / 4.13) | 0
// => 3
~~(12.4 / 4.13)
// => 3
```

## 生成随机字符串
生成随机字符串，我们第一想到的，可能是先定义一个字符串数组，然后通过随机取数组中的字符进而拼接成一个随机长度的字符串。
但是下面还有一个更简单的方法，代码如下：
```js
function generateRandomAlphaNum(len) {
    var rdmString = "";
    for (; rdmString.length < len; rdmString += Math.random().toString(36).substr(2));
    return rdmString.substr(0, len);
}

```

>主要是利用了toString() 方法的特性

![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fc619cda77ec4dd0815f1b5c94fa23a0~tplv-k3u1fbpfcp-zoom-1.image)


## console.table

Chrome专属，IE绕道的console方法。可以将JavaScript关联数组以表格形式输出到浏览器console，效果很惊赞，界面很美观。

```js
//采购情况
var data = [{'品名': '杜雷斯', '数量': 4}, {'品名': '冈本', '数量': 3}];
console.table(data);
```

![image](https://images0.cnblogs.com/blog/431064/201404/101915232787860.png)