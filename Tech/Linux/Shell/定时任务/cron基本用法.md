## cron基本使用

先来看一张图
![](cron基本用法-01.png)

``` BASH
#编辑crontab任务
vim /etc/crontab

# 启动crontab
sudo /etc/init.d/cron start

#停止crontab
sudo /etc/init.d/cron stop

#重启crontab
sudo /etc/init.d/cron restart

#重载/etc/crontab配置
sudo /etc/init.d/cron reload

# 强制重载/etc/crontab配置
sudo /etc/init.d/cron force-reload

# 查看crontab服务状态
sudo /etc/init.d/cron status

# 查看crontab运行记录
tail -f /var/log/cron.log

# 查看最近十行crontab运行记录

tail -n /var/log/cron.log
```

##问题总结

### crontab不运行

1.  查看配置是否正确 比如有没'等特殊符号 时间设置是否有错
2.  查看crontab服务状态