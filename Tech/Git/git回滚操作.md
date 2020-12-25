## git删除指定commit

1.  使用git log 命令，查看已提交的记录。例如红色圈出的commit是本次要删除的commit。

![](./git回滚操作-01.png)

<br>

2.  先找到此次提交之前的一次提交的commit 1d6b81b138f89735265900b94fcd1ec39375e7b4

3.  执行git rebase -i 1d6b81b138f89735265900b94fcd1ec39375e7b4，弹出如下页面（不包含当前commit）：

![](./git回滚操作-02.png)

<br>

按字母I键进入编辑模式，将需要删除的commit的pick改为drop，然后按esc退出编辑，：wq保存

![](./git回滚操作-03.png)

<br>

4.  再次执行git log命令，查看已提交记录，之前红色圈出的commit记录已被删除。

![](./git回滚操作-04.png)

### PS：以上方法不适用特定merge提交删除

## 优雅撤销中间某次merge提交

``` BASH
git revert commit_id
//如果commit_id是merge节点的话,-m是指定具体哪个提交点
git revert commit_id -m 1
//接着就是解决冲突
git add -A
git commit -m ".."
git revert commit_id -m 2
//接着就是解决冲突
git add -A
git commit -m ".."
git push
```

其中`git revert commit_id -m 数字`是针对，`merge`提交点的操作。
如果是普通的提交点，直接用rebase即可，不需要这么麻烦。
