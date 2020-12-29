### url匹配规则

``` nginx
location [=|~|~*|^~|@] /uri/ {
  ...
} 
```

* `=` : 表示精确匹配后面的url
* `~` : 表示正则匹配，但是区分大小写
* `~*` : 正则匹配，不区分大小写
* `^~` : 表示普通字符匹配，如果该选项匹配，只匹配该选项，不匹配别的选项，一般用来匹配目录
* `@` : "@" 定义一个命名的 location，使用在内部定向时，例如 error_page

上述匹配规则的优先匹配顺序：

1.  = 前缀的指令严格匹配这个查询。如果找到，停止搜索；
2.  所有剩下的常规字符串，最长的匹配。如果这个匹配使用 ^~ 前缀，搜索停止；
3.  正则表达式，在配置文件中定义的顺序；
4.  如果第 3 条规则产生匹配的话，结果被使用。否则，使用第 2 条规则的结果。

### 目标地址处理规则

匹配到uri后，接下来要代理到目标服务地址。

``` NGINX
upstream api_server {
  server 10.0.101.62:8081;
  server 10.0.101.61:8082;
}

location / {
        rewrite ^(.*)$ http://10.0.101.62:8000/my-module$1 break;
}

location ^~ /my-module/ {
    root   /data/my-module/dist;
    rewrite ^/my-module/(.*)$  /$1 break;
    index  index.html index.htm;
}

location /my-module/api {
    proxy_pass  http://api_server;
    proxy_set_header Host $host;
    proxy_set_header  X-Real-IP        $remote_addr;
    proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header  your-custome-header    "myHeader";
    proxy_set_header X-NginX-Proxy true;
}
```

上述配置，默认访问 `/` 会重定向到 `/my-module` , 然后直接返回 `/data/my-module/dist` 下的html等静态文件。

访问 `/my-module/api` 则会代理到我们api服务器地址，是一个默认的round-robin负载均衡配置。

下面是访问localhost的日志, 访问首页一共进行了2次重定向。

``` PHP
Request URL: http://10.0.101.62:8000/
Request Method: GET
Status Code: 302 Moved Temporarily
Location: http://10.0.101.62:8000/flash/

Request URL: http://10.0.101.62:8000/flash/
Request Method: GET
Status Code: 302 Moved Temporarily
Location: http://10.0.101.62:8000/flash/index.html

Request URL: http://10.0.101.62:8000/flash/index.html
Request Method: GET
Status Code: 304 Not Modified
```

### alias与root的区别

> root 实际访问文件路径会拼接URL中的路径
>
> alias 实际访问文件路径不会拼接URL中的路径

示例如下：

``` NGINX
location ^~ /sta/ {  
   alias /usr/local/nginx/html/static/;  
}
```

请求：`http://test.com/sta/sta1.html`
实际访问：`/usr/local/nginx/html/static/sta1.html` 文件

``` NGINX
location ^~ /tea/ {  
   root /usr/local/nginx/html/;  
}
```

请求： `http://test.com/tea/tea1.html`

实际访问： `/usr/local/nginx/html/tea/tea1.html` 文件

显然，第二次重定向是不需要的，本意是访问/flash/的时候，直接访问对应目录下的html静态文件。 但因为root拼接flash导致找不到对应文件，要重写url，去掉flash这个模块前缀，使用了 `rewrite` , 而 `rewrite` 会返回302重定向。

接下来，我们修改 `root` 为 `alias`

``` NGINX
location ^~ /flash/ {
    alias   /data/flash/dist/;
    #rewrite ^/flash/(.*)$  /$1 break;
    index  index.html index.htm;
}
```

直接重定向1次后返回html

``` PHP
Request URL: http://10.0.101.62:8000/
Request Method: GET
Status Code: 302 Moved Temporarily

Request URL: http://10.0.101.62:8000/flash/
Request Method: GET
Status Code: 200 OK (from disk cache)
```

### last 和 break关键字的区别

只用到了break，即匹配到此处后不会继续跳。

### permanent 和 redirect关键字的区别

* rewrite … permanent 永久性重定向，请求日志中的状态码为301
* rewrite … redirect 临时重定向，请求日志中的状态码为302

我们常用的 `80` 端口转 `443` ，即http转https的一种配置方案为

``` NGINX
server {
    listen 80;
    server_name demo.com;
    rewrite ^(.*)$ https://${server_name}$1 permanent; 
}
```

会返回301永久重定向到对应的https：

``` PHP
Request URL: http://demo.com/flash/index.html
Request Method: GET
Status Code: 301 Moved Permanently
Location: https://demo/flash/index.html
```

### 一些使用场景

上述demo差不多就是我平时用的前后端分离的代理配置方案。下面是一些遇到过的场景。

配置一个静态文件下载服务，我们下面软件会经常看到index /的页面。

``` NGINX
server {
        listen       8888;        #端口
        server_name  _;   #服务名

        charset utf-8,gbk;
        root    /data/download;  #显示的根索引目录
        autoindex on;             #开启索引功能
        autoindex_exact_size off; # 关闭计算文件确切大小（单位bytes），只显示大概大小（单位kb、mb、gb）
        autoindex_localtime on;   # 显示本机时间而非 GMT 时间
}
```

配置http重定向到https

``` NGINX
server {
    listen 80;
    server_name demo.com;
    rewrite ^(.*)$ https://${server_name}$1 permanent; 
}
                   
server {
    listen       443;
    server_name  demo.com;
    charset utf-8;
    location / {
       alias   /data/web;
       index  index.html index.htm;
    }
}
```

配置静态前端页面

``` NGINX
location / {
    alias   /data/web;
    index  index.html index.htm;
}
```

配置反向代理, 比如我们访问http://demo.com/api/aaa/bbb，我们想要代理到http://api.com/api/aaa/bbb, 只切换了域名，uri相同。

``` NGINX
upstream api_server {
  server 10.0.101.62:8081;
  server 10.0.101.61:8082;
}
location /api {
    proxy_pass  http://api_server;
    proxy_set_header Host $host;
    proxy_set_header  X-Real-IP        $remote_addr;
    proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header  your-custome-header    "myHeader";
    proxy_set_header X-NginX-Proxy true;
}
```

配置反向代理时，移除前缀。比如我们的服务http://demo.com/users/aaa/bbb, 我们想要代理到http://users.com/aaa/bbb，即切换域名的同时，去掉users前缀。区别是proxy_pass 结尾的 `/` .

``` NGINX
location ^~/users/ {
    proxy_set_header Host $host;
    proxy_set_header  X-Real-IP        $remote_addr;
    proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header X-NginX-Proxy true;

    proxy_pass http://users.com/;
}
```

反向代理时，想要自定义修改uri。使用rewrite正则修改。

``` NGINX
# 修改uri，去掉了flash的前缀，$1表示正则匹配到的字符串内容。
location ^~ /flash/ {
    root   /data/flash/dist/;
    rewrite ^/flash/(.*)$  /$1 break;
    index  index.html index.htm;
}

# 修改uri, 重新代理到新的地址
location ^~/order/ {
    proxy_set_header Host $host;
    proxy_set_header  X-Real-IP        $remote_addr;
    proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header X-NginX-Proxy true;

    rewrite ^/order/(.*)$ /$1 break;
    proxy_pass http://order;
}
```

代理跨域, 比如bing每日一图，不支持我们ajax获取图片地址，我们可以自己写一个支持的接口。

http://101.200.218.760/proxy/bing/HPImageArchive.aspx?format=js&idx=0&n=1

代理对象为：

https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1

``` NGINX
location ^~/proxy/bing/ {
    add_header 'Access-Control-Allow-Origin' 'http://localhost:8088';
    add_header 'Cache-Control' 'public, max-age=604800';

    add_header 'Access-Control-Allow-Credentials' 'true';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';

    rewrite ^/proxy/bing/(.*)$ /$1 break;
    proxy_pass https://cn.bing.com/; 
}
```

### 来源

* https://www.cnblogs.com/duhuo/p/8323812.html
* https://www.cnblogs.com/woshimrf/p/nginx-proxy-rewrite-url.html
