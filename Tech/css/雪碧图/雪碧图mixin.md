## 调用icon小图标的方式是通过mixin方式进行调用的

``` CSS
@mixin Ricon($width, $height, $url, $important: '') {
  @include background(#{$baseURL}#{$url}.png, $important);
  display: inline-block;
  width: $width;
  height: $height;
  background-size: 100% auto;
  background-position: center center;
}

@mixin background($url: '', $important: '') {
  @if $url !='' {
    @if ($important !='') {
      background-image: url($url) !important;
    }

    @else {
      background-image: url($url);
    }
  }

  background-repeat: no-repeat;
  background-size: 100% auto;
}
```

考虑到改造成本以及雪碧图的接入成本，解决方案是在构建过程中接入了[webpack-spritesmith](https://github.com/mixtur/webpack-spritesmith)，优点是

1.  构建过程中可根据指定目录自动生成及更新雪碧图与scss文件
2.  自动生成的scss文件模版允许自定义化
3.  无需手动引入生成的scss文件，可在webpack配置中配置自动引入

构建配置如下：

``` JS
// 配置代码
new SpritesmithPlugin({
  src: {
    // icon小图标目录
    cwd: './src/like/act_30083/assets/img/icon/',
    // 合成图片格式
    glob: '*.png'
  },
  target: {
    // 合成雪碧图本地文件地址
    image: path.resolve(__dirname, './assets/img/sprite-ignore.png'),
    css: [
      [
        // 生成雪碧图样式文件地址
        path.resolve(__dirname, './styles/mixins/_sprite-ignore.scss'),
        {
          // scss文件模板
          format: 'function_based_template'
        }
      ]
    ]
  },
  customTemplates: {
    // 自定义模板
    'function_based_template': templateFunction,
  },
  apiOptions: {
    // 雪碧图引用地址
    cssImageRef: '~@assets/img/sprite-ignore.png',
  },
  spritesmithOptions: {
    // 合成规则
    algorithm: 'binary-tree',
    // icon之间的距离
    padding: 10,
  }
});
```
