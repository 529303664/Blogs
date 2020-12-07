### 文字模糊效果

只需要添加以下两行代码，即可达到将文字模糊处理的目的。

``` css
color: transparent;
text-shadow: #111 0 0 5px;
```

<br>

![image](冷知识之CSS篇-01.png)

<br>

### 毛玻璃效果

其实毛玻璃的模糊效果技术上比较简单，只是用到了 css 滤镜（filter）中的 blur 属性。但是要做一个好的毛玻璃效果，需要注意很多细节。下面提供一个简单示例：

``` css
.blur {
  display: block;
  width: 300px;
  height: 300px;
  margin: 100px auto;
  filter: blur(10px);
}

<img src="./img/test.png"class="blur"alt="">
```

![image](冷知识之CSS篇-02.png)

### CSS中也可以做简单运算

在日常开发中，我们时常会遇到这样的需求：

> 左侧或者右侧宽度固定，然后剩余部分自动充满。

可能很多小伙伴会想到用flex布局，通过设置flex:1; 使其自动充满，当然这个做法也是对的，但是我们还有更为简便的方法，那就是利用css的calc函数，示例代码如下：

``` css
.container {
  width: calc(100% - 50px);
}
```

`calc() ` 函数用于动态计算长度值。

* 需要注意的是，运算符前后都需要保留一个空格，例如：width: calc(100% - 10px)；
* 任何长度值都可以使用calc()函数进行计算；
* calc()函数支持 "+", "-", "*", "/" 运算；
* calc()函数使用标准的数学运算优先级规则；
