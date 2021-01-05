## 背景

前不久做了一个年终盛典的 h5 移动端活动项目，活动主页有三个排行榜页面，以及任务页面。在测试过程中，测试同事反馈排行榜页面在 android 4.x 的系统下会引起 webview 的崩溃，而且是必现，而任务页面是正常的，这让我纠结了很久，因为本身页面也做了很多的优化，像图片的懒加载，组件的懒加载，排行榜列表虚拟滚动（只渲染屏幕显示部分数据），所以一时也不知道问题在哪里。

## 解决过程

仔细 review 了一下项目代码，也没发现什么端倪，就只能一点一点注释代码来调试了，发现有一段 css 代码注释掉以后 android 4.x 就正常了。

于是 google 了一番，发现是伪元素做动画惹的祸，是旧版 chromium 的问题，可以查看[官方 issue](https://bugs.chromium.org/p/chromium/issues/detail?id=364222)，crash 代码如下。

``` CSS
@-webkit-keyframes crashChrome {
  0% {
    -webkit-transform: translateX(0rem);
  }
}

.anim:before {
  content: "";
  width: 3rem;
  height: 3rem;
  border-radius: 3rem;
  position: absolute;
  left: 5rem;
  top: 5rem;
  background-color: #06839f;

  -webkit-animation: crashChrome;
}
```

``` HTML
<div class="anim"></div>
```

代码一看其实也比较正常，普普通通的的用法，就是一个 before 的伪元素做了一个 一动也不动的 animation 的动画，怎么就会奔溃了呢？

这个 bug 具体是怎么回事还没想明白，但是问题得解决呀，自己活动页面的奔溃八九不离十就是 before+animation 引起的，用 div 代替 before 先把 bug 解决了。

## 分析问题

这段 crash 的 css 代码确实比较平常，而且写法完全符合 web 的标准，故不应该是代码本身的问题。且在自己本地的开发浏览器中，以及稍微不那么旧的手机里都是正常的，所以断定这个问题因该属于浏览器的 bug，并且在某些旧版浏览器里才有的 bug，后来的新版浏览器已经修复了这个问题。

拿着会 crash 的手机测试发现，只有满足以下三个条件：伪元素（before，after 等）+ animation + rem，才会 crash。

所以得出了以下结论，在伪元素里使用 animation 动画，并且动画里有 rem 的变化就会引起了某些版本 webview 的 crash。

## 总结

这个问题与浏览器的底层渲染有关，并且官方没有给出具体哪些版本会受到影响，而在移动段 rem 是比较常规的单位，所以各位同学做项目的时候，就不要在伪元素里写动画。
