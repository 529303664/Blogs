# HTML篇冷知识

## 浏览器秒变编辑器

这个还是在浏览器地址栏上面做文章，将以下代码复制粘贴到浏览器地址栏，运行后浏览器就变成了一个原始简单的编辑器，和window自带的notepad差不多，长见识了吧，话不多说，我们来试试。

```JavaScript
data:text/html, <html contenteditable>
```

![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/efdc16760d544a9c8234fdb882876185~tplv-k3u1fbpfcp-zoom-1.image)


>归根结底多亏了HTML5中新加的contenteditable属性，当元素指定了该属性后，元素的内容成为可编辑状态。

同理，在控制台执行以下代码，同样可以将整个页面变得可以编辑。

>document.body.contentEditable='true';


![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/38a1097783444b28b86bc057a7e02d6d~tplv-k3u1fbpfcp-zoom-1.image)


## 实时编写样式的输入框
