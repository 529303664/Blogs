# 网络
###  sameSite
>Chrome 51 开始，浏览器的 Cookie 新增加了一个SameSite属性，用来防止 CSRF 攻击和用户追踪，分为Strict ，Lax，None

- `Strict`最为严格，完全禁止第三方 Cookie，跨站点时，任何情况下都不会发送 Cookie。换言之，只有当前网页的 URL 与请求目标一致，才会带上 Cookie
**这个规则过于严格，可能造成非常不好的用户体验。比如，当前网页有一个 GitHub 链接，用户点击跳转就不会带有 GitHub 的 Cookie，跳转过去总是未登陆状态**

- `Lax`规则稍稍放宽，允许同站请求发送Cookie，但大多数情况也是不发送第三方 Cookie，但是导航到目标网址的 Get 请求除外。
- `None`允许跨站请求，前提是必须同时设置Secure属性（Cookie 只能通过 HTTPS 协议发送），否则无效


HTTP → HTTPS | HTTPS → HTTP
-- | --
SameSite=Strict | ⛔ Blocked | ⛔ Blocked
SameSite=Lax | ✓ Allowed | ✓ Allowed
SameSite=None;Secure | ✓ Allowed | ⛔ Blocked

### [查看更多信息](https://web.dev/schemeful-samesite/)

### User-Agent Client Hints(UA-CH)
>从Chrome 85开始，正式发布


⬇️ ResponseAccept-CH | ⬆️ Requestheader | ⬆️ RequestExample value | Description
-- | -- | -- | --
UA | Sec-CH-UA | "Chromium";v="84","Google Chrome";v="84" | List of browser brands and their significant version.
UA-Mobile | Sec-CH-UA-Mobile | ?1 | Boolean indicating if the browser is on a mobile device (?1 for true) or not (?0 for false).
UA-Full-Version | Sec-CH-UA-Full-Version | "84.0.4143.2" | The complete version for the browser.
UA-Platform | Sec-CH-UA-Platform | "Android" | The platform for the device, usually the operating system (OS).
UA-Platform-Version | Sec-CH-UA-Platform-Version | "10" | The version for the platform or OS.
UA-Arch | Sec-CH-UA-Arch | "ARM64" | The underlying architecture for the device. While this may not be relevant to displaying the page, the site may want to offer a download which defaults to the right format.
UA-Model | Sec-CH-UA-Model | "Pixel 3" | The device model.

### JavaScript API
Alongside the headers, the User-Agent can also be accessed in JavaScript via navigator.userAgentData. The default Sec-CH-UA and Sec-CH-UA-Mobile header information can be accessed via the brands and mobile properties, respectively:

```JavaScript
// Log the brand data
console.log(navigator.userAgentData.brands);

// output
[
  {
    brand: 'Chromium',
    version: '84',
  },
  {
    brand: 'Google Chrome',
    version: '84',
  },
];

// Log the mobile indicator
console.log(navigator.userAgentData.mobile);

// output
false;
```

### [查看更多信息](https://web.dev/user-agent-client-hints/)

# CSS布局
> 介绍了一些grid新特性

### 强居中
<img src="https://user-images.githubusercontent.com/5030910/100298195-71db5c00-2fcb-11eb-89a2-f4e5ed8a4e8d.png"  align=center />

### 三段式布局
<img src="https://user-images.githubusercontent.com/5030910/100298209-7a339700-2fcb-11eb-95df-49fff7c11a46.png"  align=center />

### 经典布局
<img src="https://user-images.githubusercontent.com/5030910/100298312-c8e13100-2fcb-11eb-8631-d0aba105fa86.png"  align=center />

### [查看更多实例](http://1linelayouts.glitch.me/)

### 思考：优化运营后台页面，自适应布局？


# 搜索（高级SEO）
> 利用结构化数据获取 Google 搜索的自然流量

### 构建富媒体搜索数据，助力Bigo海外电商，直播，imoJobs等业务

- ### [电商](https://developers.google.com/search/docs/data-types/product)
 <img src="https://user-images.githubusercontent.com/5030910/100297927-bfa39480-2fca-11eb-8df7-99606a72f2cf.png"  align=center />

-  ### [直播](https://developers.google.com/search/docs/data-types/video) 
![image](https://user-images.githubusercontent.com/5030910/100444919-3a61d200-30e7-11eb-9fdb-bcf3f609608b.png)

- ### [imojobs](https://developers.google.com/search/docs/data-types/job-posting)
 <img src="https://user-images.githubusercontent.com/5030910/100225858-cfcf5b80-2f59-11eb-81fd-ecb766bfc198.png"  align=center />

[测试地址](https://search.google.com/test/rich-results)

### 下面是一个购物信息汇总网站页面示例
```html
 <html>
  <head>
    <title>Executive Anvil</title>
  </head>
  <body>
  <div>
    <div itemtype="http://schema.org/Product" itemscope>
      <meta itemprop="mpn" content="925872" />
      <meta itemprop="name" content="Executive Anvil" />
      <link itemprop="image" href="https://example.com/photos/16x9/photo.jpg" />
      <link itemprop="image" href="https://example.com/photos/4x3/photo.jpg" />
      <link itemprop="image" href="https://example.com/photos/1x1/photo.jpg" />
      <meta itemprop="description" content="Sleeker than ACME's Classic Anvil, the Executive Anvil is perfect for the business traveler looking for something to drop from a height." />
      <div itemprop="offers" itemtype="http://schema.org/AggregateOffer" itemscope>
        <meta itemprop="lowPrice" content="119.99" />
        <meta itemprop="highPrice" content="199.99" />
        <meta itemprop="offerCount" content="6" />
        <meta itemprop="priceCurrency" content="USD" />
      </div>
      <div itemprop="aggregateRating" itemtype="http://schema.org/AggregateRating" itemscope>
        <meta itemprop="reviewCount" content="89" />
        <meta itemprop="ratingValue" content="4.4" />
      </div>
      <div itemprop="review" itemtype="http://schema.org/Review" itemscope>
        <div itemprop="author" itemtype="http://schema.org/Person" itemscope>
          <meta itemprop="name" content="Fred Benson" />
        </div>
        <div itemprop="reviewRating" itemtype="http://schema.org/Rating" itemscope>
          <meta itemprop="ratingValue" content="4" />
          <meta itemprop="bestRating" content="5" />
        </div>
      </div>
      <meta itemprop="sku" content="0446310786" />
      <div itemprop="brand" itemtype="http://schema.org/Brand" itemscope>
        <meta itemprop="name" content="ACME" />
      </div>
    </div>
  </div>
  </body>
</html>
```
### 思考：可以利用Node+CDN服务搭建富媒体HTML直出平台，优化SEO？

# 自动化测试
### [ PageSpeed Insights(PSI)](https://developers.google.com/speed/pagespeed/insights/)
> PSI 作为一款专注于改进网页性能的开发者工具

### 它主要具有以下两个优势：
- 真实的网页运行速度。这是 PSI 2.0 中的新功能，PSI 结合 Chrome 用户体验报告中的数据，向开发者展示他们的网页的实际性能，这一点对于开发者来说是很有价值的。那么，PSI 则成为了用户获得真实的网页运行速度的窗口。
- 优化建议。根据一些常用的网页性能优化规则(如避免过多的重定向)，PSI 会基于该网页的优化空间为用户提供一些网页优化建议。


### [Puppeteer](https://github.com/puppeteer/puppeteer)
>Nodejs工具库，它提供了高级的JavaScript API 来通过DevTools控制 Chromium与其他浏览器

#### Puppeteer能做什么？
- 生成页面的屏幕截图和PDF。
- 爬取SPA（单页应用程序）并生成预渲染的内容（即“ SSR”（服务器端渲染））。
- 高级爬虫，可以爬取大量异步渲染内容的网页。
- 自动进行表单提交，UI测试，键盘输入，模拟时区，改变深色主题等。
- 创建最新的自动化测试环境。使用最新的JavaScript和浏览器功能，直接在最新版本的Chrome中运行测试。
- 捕获站点的时间线跟踪，以帮助诊断性能问题。
- 测试Chrome扩展程序。

#### example.js
```js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();
```

> node example.js

#### 最新进展介绍
 <img src="https://user-images.githubusercontent.com/5030910/100229116-aebd3980-2f5e-11eb-8c5b-e85159a427d7.png " width = "500" align=center />

### 思考：可以构建Serveless服务，搭建FaaS平台，助力前端服务和运营服务？


### Web Vitals

>什么是 Web Vitals ，Google 给的定义是一个良好网站的基本指标 (Essential metrics for a healthy site)，为什么还要再定义一个新的指标集，原因是过去要衡量一个好的网站，需要使用的指标太多，推出 Web Vitals 是简化这个学习的曲线，站主只要观注 Web Vitals 指标表现即可。

#### 三大指标
![image](https://user-images.githubusercontent.com/5030910/100299467-bf0cfd00-2fce-11eb-972f-48b4b8c60a3c.png)


#### 使用[web-vitals](https://github.com/GoogleChrome/web-vitals)库，测量每个指标就像调用单个函数一样简单（有关完整用法和 API详细信息，请参阅文档 ）：
```js
import {getCLS, getFID, getLCP} from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  (navigator.sendBeacon && navigator.sendBeacon('/analytics', body)) ||
      fetch('/analytics', {body, method: 'POST', keepalive: true});
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```


Platform | LCP | FID | CLS
| -- | -- | -- | --
[Chrome User Experience Report](https://developers.google.com/web/tools/chrome-user-experience-report) | ✔ | ✔ | ✔
[PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/) | ✔ | ✔ | ✔
[Search Console (Core Web Vitals report)](https://support.google.com/webmasters/answer/9205520) | ✔ | ✔ | ✔|

### 思考：利用Web Vitals结合puppeteer，搭建网页自动化测试平台，爬虫工具？


# Chrome相关（DevTools，Lighthouse）
### [支持CSS-in-JS框架的样式编辑](https://developers.google.com/web/updates/images/2020/06/css-in-js.mp4)
![image](https://user-images.githubusercontent.com/5030910/100299322-60e01a00-2fce-11eb-96b6-a37621b3180a.png)

### 模拟时区
![image](https://user-images.githubusercontent.com/5030910/100299410-92f17c00-2fce-11eb-8447-6eb810ec5a8d.png)

### 媒体面板
![image](https://user-images.githubusercontent.com/5030910/100299683-35a9fa80-2fcf-11eb-9a67-cf3927b48199.png)

### 一键修复文字的色彩对比
![image](https://user-images.githubusercontent.com/5030910/100299746-638f3f00-2fcf-11eb-9e12-0e2a7017c6a9.png)


### 利用Lighthouse 生成性能报告
![image](https://user-images.githubusercontent.com/5030910/100299914-d0a2d480-2fcf-11eb-8500-a0fdc33c45c0.png)


### [更多内容查看这里](https://developers.google.com/web/updates)

# PWA与WebPush
### 利用PWA解决以下问题
![image](https://user-images.githubusercontent.com/5030910/100417600-3cfb0200-30bc-11eb-8c5b-16148406d95c.png)

### WebPush流程图
#### 授权流程
![Web push授权流程](https://user-images.githubusercontent.com/5030910/100417630-50a66880-30bc-11eb-8ecc-2199dab3dc11.png)

#### 通知流程
![image](https://user-images.githubusercontent.com/5030910/100417986-eb06ac00-30bc-11eb-9ecf-6b3dd9b5a69e.png)

#### 代码实现
![image](https://user-images.githubusercontent.com/5030910/100418090-17bac380-30bd-11eb-8ca5-6fe9c18deddd.png)

#### 成果
![image](https://user-images.githubusercontent.com/5030910/100418205-505a9d00-30bd-11eb-9bda-9e12c38f60f1.png)

### 思考：利用Node，搭建PWA构建平台，助力海外电商业务，将营销推广类活动页封装成PWA

# TensorFlow.js
### 来分享一个有意思的场景

#### [交互式《蒙娜丽莎》画像](https://blog.tensorflow.org/2020/09/bringing-mona-lisa-effect-to-life-tensorflow-js.html)

>传说中，不管你从哪个角度看《蒙娜丽莎》画像，都会感到画像中的女子在看着你。TensorFlow 的官方博客，演示怎么用 TensorFlow.js，制作一个交互式的《蒙娜丽莎》画像，摄像头捕捉观看者的角度，然后自动改变画像的眼神。

![image](https://www.wangbase.com/blogimg/asset/202009/bg2020092603.jpg)
![image](https://www.wangbase.com/blogimg/asset/202009/bg2020092604.jpg)


#### 利用TensorFlow Privacy 检查隐私保护措施
![image](https://user-images.githubusercontent.com/5030910/100418941-851b2400-30be-11eb-98cf-af0d5dbb1a5f.png)
![image](https://user-images.githubusercontent.com/5030910/100419020-a3811f80-30be-11eb-9237-c33f9de6b58a.png)
![image](https://user-images.githubusercontent.com/5030910/100419041-ada31e00-30be-11eb-88cd-0c5f8b2c89bd.png)

### 思考：或许可以利用Node+TensorFlow，对于用户上传的图片进行二次处理？

### [官网](https://www.tensorflow.org/js/?hl=zh_cn)
### [入门课程](https://www.icourse163.org/learn/youdao-1460578162?tid=1461280442#/learn/content)


### [Flutter Web](https://flutter.dev/web)

### [视频集合链接](https://space.bilibili.com/64169458/channel/detail?cid=156180)
