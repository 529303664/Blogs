## 负载均衡

负载均衡定义：代理服务器将接收的请求均衡的分发到各服务器中
负载均衡作用：主要解决网络拥塞问题，提高服务器响应速度，服务就近提供，达到更好的访问质量，减少后台服务器并发压力。

## 负载均衡的配置实例

可访问的服务有两个：

* http://172.16.25.44:8080/rsbi
* http://192.168.1.138:8080/rsbi

nginx.conf完整配置如下：

``` NGINX
 
#user  nobody;
worker_processes  1;
 
events {
    worker_connections  1024;
}
 
http {
        include       mime.types;
        default_type  application/octet-stream;
 
        sendfile        on;
 
        keepalive_timeout  65;
        #此处定义常量xd-projec
        upstream xd-project{
                #注意 此处的server只能是ip:port 不能有任何多余的http或者项目名称
                server 172.16.25.44:8080;
                server  192.168.1.138:8080;
        }
        server{
                listen 8081;
                server_name  localhost;
                location / {
                        #此处使用上面定义常量xd-projec
                        proxy_pass http://xd-project;
                }
 
                location ~ .* {
                        proxy_pass http://xd-project;
                        proxy_set_header Host $http_host;
                        proxy_set_header X-Real-IP $remote_addr;
                        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                }
       
                error_page   500 502 503 504  /50x.html;
                location = /50x.html {
                    root   html;
                }
        }
        include servers/*;
}
```

说明：上面的均衡方式是轮询，即nginx的默认负载均衡方式

## nginx的负载均衡策略及其适用场景

### 1.  轮询（默认） 

每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务器down掉，能自动剔除。主要用于大量请求场景中环节服务端的压力。
配置实例：

``` NGINX
upstream xd-project{
        #注意 此处的server只能是ip:port 不能有任何多余的http或者项目名称
        server 172.16.25.44:8080;
        server  192.168.1.138:8080;
} 
```  

### 2.  weight 

指定轮询几率，weight和访问比率成正比，用于后端服务器性能不均的情况。 
配置实例
``` NGINX
upstream xd-project{
  #注意 此处的server只能是ip:port 不能有任何多余的http或者项目名称
  server 172.16.25.44:8080 weight=1;
  server  192.168.1.138:8080 weight=2;
}
```

说明：假设有三次访问，因为weight的值，会有一次落在172.16.25.44:8080，两次落在192.168.1.138:8080
应用场景：后端服务器性能不均的情况

### 3.  ip_hash

每个请求按访问ip的hash结果分配，这样每个访客固定访问一个后端服务器，可以解决session的问题。
配置实例：

``` NGINX
upstream xd-project{
        ip_hash;
        server 172.16.25.44:8080;
        server  192.168.1.138:8080;
}
```

应用场景：当你服务端的一个特定url路径会被同一个用户连续访问时，如果负载均衡策略还是轮询的话，那该用户的多次访问会被打到各台服务器上，这显然并不高效（会建立多次http链接等问题）。甚至考虑一种极端情况，用户需要分片上传文件到服务器下，然后再由服务器将分片合并，这时如果用户的请求到达了不同的服务器，那么分片将存储于不同的服务器目录中，导致无法将分片合并。

### 4.  url_hash（第三方）

每个请求按访问url的hash结果分配，这样每个url请求固定访问一个后端服务器。  
配置实例：

``` NGINX
upstream xd-project{
        hash $request_uri;
        server 172.16.25.44:8080;
        server  192.168.1.138:8080;
}
```

应用场景：
一般来讲，要用到urlhash，是要配合缓存命中来使用。举一个我遇到的实例：有一个服务器集群A，需要对外提供文件下载，由于文件上传量巨大，没法存储到服务器磁盘中，所以用到了第三方云存储来做文件存储。服务器集群A收到客户端请求之后，需要从云存储中下载文件然后返回，为了省去不必要的网络带宽和下载耗时，在服务器集群A上做了一层临时缓存（缓存一个月）。由于是服务器集群，所以同一个资源多次请求，可能会到达不同的服务器上，导致不必要的多次下载，缓存命中率不高，以及一些资源时间的浪费。在此类场景下，为了使得缓存命中率提高，很适合使用url_hash策略，同一个url（也就是同一个资源请求）会到达同一台机器，一旦缓存住了资源，再此收到请求，就可以从缓存中读取，既减少了带宽，也减少的下载时间。

### 5.  fair（第三方） 

按后端服务器的响应时间来分配请求，响应时间短的优先分配。

## 负载均衡session会话保持方法

负载均衡时，为了保证同一用户session会被分配到同一台服务器上，可以使用以下方法：

1.  使用cookie

将用户的session存入cookie里，当用户分配到不同的服务器时，先判断服务器是否存在该用户的session，如果没有就先把cookie里面的sessoin存入该服务器，实现session会话保持。缺点是存入cookie有安全隐患。

2.  使用缓存

利用memcache，redis等缓存分布式的特点，可以将所有服务器产生的session存入同一台服务器的缓存中，实现session共享。这样安全性比较高，而且从内存中读取session比从文件中读取速度快。

3.  使用ip_hash

如果是nginx服务器的负载均衡，可以在upstream里设置ip_hash，每个请求按访问ip的hash结果分配，映射到固定某一台的服务器。缺点是可能导致负载不均衡。

## upstream中的down和backup

![alt](./Nginx的负载均衡实例，均衡策略，session保持方案-01.png)
