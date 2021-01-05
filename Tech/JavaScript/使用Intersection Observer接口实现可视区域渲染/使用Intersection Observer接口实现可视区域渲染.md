## 使用Intersection Observer接口实现可视区域渲染

由于客户端使用的webview内核在较低配置的Android手机上打开多图页面时出现内存暴涨，
无法回收导致客户端崩溃的情况，我们使用Android studio进行分析发现，问题出在了
webview的图层渲染引擎。我们发现，随着我们下拉加载越多，图片量增多时，图层渲染
Graphics部分内存持续上涨，且不存在回收的情况。因此，这种情况下，使用图片懒加载已经
不能解决问题了。经过调研，我们采用了Intersection Observer 实现虚拟渲染的方案，即
只在可视区域才进行图片的渲染。

## 为什么使用Intersection Observer 接口

Intersection Observer API提供了一种异步检测目标元素与祖先元素或viewport相交变化情况的方法
（MDN）。换句话说，之前检测元素是否可见，元素与元素是否相交是不容易的，可能的几个方法是基于监听滚
动事件，再结合使用元素的宽高属性，以计算元素当前所处位置这种耗性能的方式。前述类型的方法，在监听滚动
事件的过程中, 频繁调用Element.getBoundingClientRect方法，会使得浏览器重复多次计算元素的宽高
属性。事件监听和调用Element.getBoundingClientRect都是在主线程上运行，这样 可能会阻塞后续js
代码的执行，造成性能问题。如果使用Intersection Observer接口，我们不但省去了自己编写代码计算位
置的功夫，而且因该接口是异步的，还使得我们在执行该接口进行监测的时候不会阻塞js线程的执行，可以说是一举两得。

## 实现原理

Intersection Observer 接口通过观测根元素和目标元素的相对位置，在开发者设定的目标元素与根元素相交触发点
触发回调函数，以实现开发者的业务目的。开发者可以设置一些数值来指定目标元素进入到根元素的百分之几时触发回调函数。

![img](./使用IntersectionObserver接口实现可视区域渲染-01.gif)

在上面的gif中，根元素是白色的视窗，目标元素为绿色的小方块。可以看到，当滚动屏幕时，绿色方块逐渐出现在视口中，
分别在绿色方块与视口相交比例达到25%, 50%, 75%, 100%时触发了回调函数。
当然，我们可以把任意一个目标元素的祖先元素当作根元素，这对于懒加载，视频播放等都有重要的意义。

## 怎么使用Intersection Observer API

1、新建一个观察器

``` JS
const callback = (entries) => {};
const options = () => {};
const observer = new IntersectionObserver(callback, options);
```

callback 为相交时的处理函数, 每当被观测的元素与指定的根元素或视窗相交时便会被执行。其参数
为IntersectionObserverEntry对象，该对象记录了相交时的一些状态信息，如元素的宽高，相交比率
等信息。
options, 用于指定回调函数执行时被观测元素的的环境。如指定根元素root, 指定被观测元素位于哪个位置时
触发相交处理函数rootMargin, 具体可见[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

2、指定相交时的处理函数

``` JS
const callback = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { // 当true时，表示被观测元素与指定元素相交了
      // 执行你要的操作
    }
  })
}
```

3、对目标元素进行观察

``` JS
const ele = document.getElementById('target');
observer.observe(ele);
```

4、Intersection Observer可用的方法

``` JS

1. observe(ele): 用于开始观察某个指定的目标元素， 观察者可以多次调用此方法对不同的元素进行观测。
2. unobserve(ele): 可用来取消对某个元素的观察。
3. disconnect(): 使用该方法， 可以取消对所有元素的观测， 即之前通过observer方法观测的元素不再受到观测，

相应的处理函数也不会得到执行。
```

## 实现可视区域渲染

### 实现思路

我们把视口当作根元素，将头像容器元素作为目标元素，设定当头像容器的面积出现在视口（即与视口相交）的比例超过
50%时， 就触发一次我们的回调函数，离开时也触发我们的回调函数。回调函数的功能为，当相交且目标元素可见时，将
头像url地址赋值给头像元素的背景（你也可以用img来实现）url，当离开时则将目标元素的背景url置空，以保证图像
渲染层保存的图片仅是目前可视区域的图片，以达到控制图像渲染引擎内存占用的目的。

### 具体实现

1.  首先，新建一个观察者

``` JS
let hasInterSection;
try {
  require('intersection-observer');
  hasInterSection = true;
} catch (e) {
  hasInterSection = false;
  console.log(e);
}

const observer = hasInterSection && (new IntersectionObserver((entries, options) => {
  entries.forEach(isIntersectHandler);
}, {
  rootMargin: '0px 0px 0px 0px',
  threshold: [0.5],
  trackVisibility: true,
  delay: 300
}));
```

> 在新建一个observer之前，先尝试引入intersection-observer插件，这是Intersection Observer

的polyfill，是为了兼容一些暂时不支持该接口的浏览器。
引入后，在新建的观察器中，我们传入了一些配置，在这里，我们根元素就是视口元素，且没有对视口的范围进行扩充
（rootMargin: '0px 0px 0px 0px', ）, 如果要对视口的范围进行扩充或缩小，则可以改变rootMargin的值。
这里，相交比例达到0.5时，我们才让它显示头像，离开时也是达到0.5才会隐藏头像，关于threshold的理解，mdn有一
个很好的例子：threshold.
至于我们例子中为什么设置了0.5的比例，主要还是出于业务需要，因为在滚动屏幕过程中，当一个目标元素进入到视口时，
如果没有达到50%的比例，则认为还没出现，则不对其头像进行赋值。trackVisibility设置为true，是因为我们有
对元素是否可见进行一个判断的需要。回调函数中，我们对entries逐一进行处理，因为observer可以监测多个元素，
所以entries是一个数组，需要逐一处理。

2.  回调函数的处理函数

``` JS
function isIntersectHandler(entry) {
  const target = entry.target;
  const isIntersecting = entry.isIntersecting;
  if (isIntersecting) {
    const src = target.dataset.src;
    const ele = target.getElementsByClassName('user-item-thump-icon')[0];
    if (src && entry.isVisible) {
      const styleStr = `url(${src}), url("${defaultAvatar}")`;
      ele.style.backgroundImage = styleStr;
    } else {
      ele.style.backgroundImage = '';
    }
  } else {
    const ele = target.getElementsByClassName('user-item-thump-icon')[0];
    ele && (ele.style.backgroundImage = '');
  }
}
```

> 回调函数的处理函数中，我们对单个entry进行处理。首先我们判断元素是否相交（正常来说能触发这个函数的

都是已经相交了的），相交的时候则从目标元素的dataset中拿到头像url并判断是否可见，从而赋值到背景url, 
以使得头像被渲染。当离开时，则对背景url进行置空操作，使得其不被渲染。

3.  开始观察元素

``` JS
mounted() {
  observer.observe(this.$refs.thump);
}
```

> 开始监测后即可对元素的背景url进行自定义的操作了。

4.  停止观察元素

``` JS
beforeDestroy() {
  observer.unobserve(this.$refs.thump);
}
```

### 几个注意点

虽然监测函数的执行是异步的，但是回调函数的执行是在主线程上。如果回调函数里面处理的逻辑比较复杂，则可能影响
js线程的执行，此时建议采用 `window.requestIdleCallback` 。
对于目标元素的visible，受多个因素影响，如opacity, translation等属性都可能影响，具体可参考[google](https://developers.google.com/web/updates/2019/02/intersectionobserver-v2).
