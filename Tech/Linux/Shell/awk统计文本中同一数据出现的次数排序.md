突然发现awk原来可以统计同一数据在要处理的文件中所出现的次数. 原来的时候 为了分析数据还自己写程序, 哎, 无语, 当时还以为自己多强, 手工分析不过来的东西写程序处理. 现在想来实在是年少轻狂. 解决问题嘛, 不讲究方式, 只要快速 高效的完成任务就OK了.

好, 今天小试牛刀统计了一下passwd文件中shell部分重复的shell名和出现的次数, 看命令:

 ``` BASH
$awk -F: '{a[$7]++}END{for (i in a) print i" "a[i]}' /etc/passwd
/bin/false 13
/bin/sh 18
/bin/bash 2
/usr/sbin/nologin 1
/bin/sync 1
```

### 解说一下

* -F: 以: 分割字段
* a[7]++定义了个名称为a的数组7]++定义了个名称为a的数组7在passwd文件中是shell名，在这里是数组索引.awk的数据- 索引可以是是字符类型这点真 是太帅了.
* for (i in a) print i” “a[i]
* 用for循环取出数据来, 这时候i取的时下标, a[i]是里面存储的数据
* 是$7出现的次数, 狠!
* 郁闷了, 这办法太强了, 以后再遇到问题还是先baidu, 再google然后再自己动手吧!

补充：
后来发现，如果awk玩得不咋熟悉的话，用命令组合也可以实现同样的功能

 ``` BASH
 awk -F: '{print $7}'|sort|uniq -c /etc/passwd
```

**快速统计日志文件里点击量前十位的URL**

关于shell命令，网上流传着很多奇技淫巧，比如说快速统计日志文件里点击量前十位的URL：

 ``` BASH
awk ‘{print $7}’ /path/to/log | sort | uniq -c | sort -nr | head -n 10
```
