>我们都知道竖书成行，自右向左换行是古文中的一种书写方式。那么在CSS中writing-mode就定义了文本在水平或垂直方向上排列方式。下面我们通过writing-mode这个属性定义一个“竹简”书写方式，同时如果在竖行文本中穿插阿拉伯数字时又当如何？

我们要定义竹简的书写方式前，首先回顾下 CSS `writing-mode` 属性，它是定义文本在水平或垂直方向上如何排列。

![](./冷知识之CSS篇【竖行横书组合】-01.jpg)

CSS text-combine-upright 竖行横书组合

### writing-mode语法

``` CSS
writing-mode: horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr
```

- horizontal-tb：水平方向自上而下的书写方式。
- vertical-rl：垂直方向自右而左的书写方式。
- vertical-lr：垂直方向内内容从上到下，水平方向从左到右。
- sideways-rl：内容垂直方向从上到下排列。

由此，我们若要定义出“竹简”的书写模式，就可以运用`vertical-rl`值，垂直方向由右到左。

**示例**

先吟诗一首🤭以此为例开始

同在屋檐下，惟有偶遇。

犹如白驹过隙，言之不尽。

因有时不我与，爬耳搔腮，

心之不及也。

—— Lucas

``` CSS
div{
  writing-mode: vertical-rl;
}
```

``` HTML
<div>
  <p>同在屋檐下，</p>
  <p>惟有偶遇。</p>
  <p>犹如白驹过隙，</p>
  <p>言之不尽，</p>
  <p>因有时不我与，</p>
  <p>爬耳搔腮，</p>
  <p>心之不及也。</p>
  <p>—— DeathGhost</p>
</div>
```

![](./冷知识之CSS篇【竖行横书组合】-02.jpg)

CSS writing-mode 文本排布

接下来，我们看看竖行排布中的“意外”。看看下面的图例。

![](./冷知识之CSS篇【竖行横书组合】-03.jpg)

CSS 书写模式 `writing-mode: vertical-rl` （从右到左）

可以看出，若以中文描述还好，但若加入阿拉伯数字，就显得怪异。

那么可否将数字转为横向（常规）书写？

下面我们重点看看CSS中的另一个属性。

### text-combine-upright 竖行横书组合

``` CSS
/* Keyword values */
text-combine-upright: none;
text-combine-upright: all;

/* Digits values */
text-combine-upright: digits;
text-combine-upright: digits 4;

/* Global values */
text-combine-upright: inherit;
text-combine-upright: initial;
text-combine-upright: unset;
```

- `none`: 没有特殊处理。
- `all`: 试图将元素内的字符水平排列，使其它们在竖行中占据单个字符空间。
- `digits`: 尝试显示一个连续的ASCII数字序列（U + 0030–U + 0039），该序列的字符数少于或等于指定的整数，以致于它在垂直行框中占据单个字符的空间。如果省略整数，则计算结果为2。2-4范围以外的整数无效。

值 `digits` 目前浏览器上没有看到效果，这里预先搁置。

我们要将上述文本中的数字让其横向排列，按属性值就是将其水平排列，让其占据单个字符空间。

那么，样式文本定义就可以这样：

``` CSS
div{
  writing-mode: vertical-rl;
  letter-spacing: 1px;
}
div b{
  text-combine-upright: all;
  margin: 5px 0;
}
```

``` HTML
<div>
  <h1>清朝</h1>
  <p>是中国历史上最后一个封建王朝，</p>
  <p>共传十二帝，</p>
  <p>统治者为满洲爱新觉罗氏。</p>
  <p>从努尔哈赤建立后金起，</p>
  <p>总计<b>296</b>年。</p>
  <p>从皇太极改国号为清起，国祚<b>276</b>年。</p>
  <p>建立全国性政权算起为<b>268</b>年。</p>
</div>
```
对文本中的<b>标签定义`text-combine-upright`为`all`即可。

![](./冷知识之CSS篇【竖行横书组合】-04.jpg)

CSS text-combine-upright 竖行横书组合

虽然如此，但是，它也是有一定的局限性。

例如，我们将“数字+年”合为一起，或更多文本合为一起，就会看到段尾效果。

![](./冷知识之CSS篇【竖行横书组合】-05.jpg)

CSS text-combine-upright 竖行横书组合

所以，它占据单个字符空间压缩是有一定限制。

本示例于浏览器 `chrome87` 版本，详细可阅读[这里](https://drafts.csswg.org/css-writing-modes-4/#text-combine-upright)。