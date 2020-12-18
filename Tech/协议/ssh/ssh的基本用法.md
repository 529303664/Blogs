## ssh登录服务器命令

``` BASH
ssh hostname
```

上面命令中， `hostname` 是主机名，它可以是域名，也可能是 IP 地址或局域网内部的主机名。不指定用户名的情况下，将使用客户端的当前用户名，作为远程服务器的登录用户名。

如果要指定用户名，可以采用下面的语法。

``` BASH
ssh user@hostname
```

上面的命令中，用户名和主机名写在一起了，之间使用 `@` 分隔。

指定用户名，可以使用 `ssh` 和 `-l` 参数

``` BASH
ssh -l username host
```

ssh 默认连接服务器的 `22` 端口， `-p` 参数可以指定其他端口

``` BASH
ssh -p 8821 hostname
```

## ssh执行远程命令

将命令直接写在 `ssh` 命令的后面

``` BASH
ssh username@hostname command
```

上面的命令会使得 SSH 在登录成功后，立刻在远程主机上执行命令 `command` 。

例子

``` BASH
ssh foo@server.example.com cat /etc/hosts
```

上面的命令会在登录成功后，立即远程执行命令 `cat /etc/hosts` 。

## ssh命令行配置项

### `-c` 参数指定加密算法。

``` BASH
$ ssh -c blowfish,3des server.example.com
# 或者
$ ssh -c blowfish -c 3des server.example.com
```

上面命令指定使用加密算法 `blowfish` 或 `3des`

### `-C` 参数表示压缩数据传输

``` BASH
ssh -C server.example.com
```

### `-d` 参数设置打印的 debug 信息级别，数值越高，输出的内容越详细。

``` BASH
ssh –d 1 foo.com
```

### `-D` 参数指定本机的 Socks 监听端口

> 该端口收到的请求，都将转发到远程的 SSH 主机，又称动态端口转发

``` BASH
 ssh -D 1080 server
```

上面命令将本机 1080 端口收到的请求，都转发到服务器 `server`

### `-f` 参数表示 SSH 连接在后台运行

### `-F` 参数指定配置文件

``` BASH
ssh -F /usr/local/ssh/other_config
```

上面命令指定使用配置文件 `other_config`

### `-i` 参数用于指定私钥

> 意为“identity_file”，默认值为~/.ssh/id_dsa。注意，对应的公钥必须存放到服务器

``` BASH
ssh -i my-key server.example.com
```

### `-l` 参数指定远程登录的账户名

``` BASH
$ ssh -l sally server.example.com
# 等同于
$ ssh sally@server.example.com
```

### `-L` 参数设置本地端口转发

``` BASH
ssh  -L 9999:targetServer:80 user@remoteserver
```

上面命令中，所有发向本地 `9999` 端口的请求，都会经过 `remoteserver` 发往 `targetServer` 的 `80` 端口，这就相当于直接连上了 `targetServer` 的 `80` 端口

### `-m` 参数指定校验数据完整性的算法

``` BASH
ssh -m hmac-sha1,hmac-md5 server.example.com
```

上面命令指定数据校验算法为 `hmac-sha1` 或 `hmac-md5`

### `-o` 参数用来指定一个配置命令

``` BASH
ssh -o "Keyword Value"
```

举例来说，配置文件里面有如下内容。

``` BASH
User sally
Port 220
```

通过 `-o` 参数，可以把上面两个配置命令从命令行传入。

``` BASH
ssh -o "User sally" -o "Port 220" server.example.com
```

使用等号时，配置命令可以不用写在引号里面，但是等号前后不能有空格

``` BASH
ssh -o User=sally -o Port=220 server.example.com
```

### `-p` 参数指定 SSH 客户端连接的服务器端口

``` BASH
ssh -p 2035 server.example.com
```

上面命令连接服务器的2035端口

### `-q` 参数表示安静模式（quiet），不向用户输出任何警告信息

``` BASH
ssh –q foo.com
root’s password:
```

上面命令使用 `-q` 参数，只输出要求用户输入密码的提示

### `-R` 参数指定远程端口转发

``` BASH
ssh -R 9999:targetServer:902 local
```

上面命令需在跳板服务器执行，指定本地计算机 `local` 监听自己的 9999 端口，所有发向这个端口的请求，都会转向 targetServer 的 902 端口

### `-t` 参数在 ssh 直接运行远端命令时，提供一个互动式 Shell

``` BASH
ssh -t server.example.com emacs
```

### `-v` 参数显示详细信息

``` BASH
ssh -v server.example.com
```

`-v` 可以重复多次，表示信息的详细程度，比如 `-vv` 和 `-vvv`

``` BASH
$ ssh -vvv server.example.com
# 或者
$ ssh -v -v -v server.example.com
```

上面命令会输出最详细的连接信息

### `-V` 参数输出 ssh 客户端的版本

``` BASH
$ ssh –V
ssh: SSH Secure Shell 3.2.3 (non-commercial version) on i686-pc-linux-gnu
```

上面命令输出本机 ssh 客户端版本是 `SSH Secure Shell 3.2.3`

### `-X` 参数表示打开 X 窗口转发

``` BASH
ssh -X server.example.com
```

### -1, -2参数指定使用 SSH1, SSH2 协议。

``` BASH
ssh -2 server.example.com
```

### `-4` 指定使用 IPv4 协议，这是默认值

``` BASH
ssh -4 server.example.com
```

### `-6` 指定使用 IPv6 协议

``` BASH
ssh -6 server.example.com
```
