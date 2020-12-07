# 利用[Minikube](https://minikube.sigs.k8s.io/docs/start/)搭建k8s

## 1、Installation

### Linux

Binary download 

``` BASH
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

Debian package

``` BASH
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube_latest_amd64.deb
sudo dpkg -i minikube_latest_amd64.deb
```

RPM package

``` BASH
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-latest.x86_64.rpm
sudo rpm -ivh minikube-latest.x86_64.rpm
```

## 2、Start your cluster

### 启动minikube

``` BASH
minikube start
```

### 启动k8s仪表板（Dashboard）

``` BASH
minikube dashboard
```

## 3、创建 Deployment

> Kubernetes Pod 是由一个或多个 为了管理和联网而绑定在一起的容器构成的组。 本教程中的 Pod 只有一个容器。 Kubernetes Deployment 检查 Pod 的健康状况，并在 Pod 中的容器终止的情况下重新启动新的容器。 Deployment 是管理 Pod 创建和扩展的推荐方法。

### 1. 使用 `kubectl create` 命令创建管理 Pod 的 Deployment。该 Pod 根据提供的 Docker 镜像运行 Container。

``` BASH
kubectl create deployment hello-node --image=k8s.gcr.io/echoserver:1.4
```

### 2. 查看 Deployment：

``` BASH
kubectl get deployments
```

#### 输出结果类似于这样：

``` BASH
NAME         READY   UP-TO-DATE   AVAILABLE   AGE
hello-node   1/1     1            1           1m
```

### 3. 查看Pod：

``` BASH
kubectl get pods
```

#### 输出结果类似于这样：

``` BASH
NAME                          READY     STATUS    RESTARTS   AGE
hello-node-5f76cf6ccf-br9b5   1/1       Running   0          1m
```

### 4. 查看集群事件：

``` BASH
kubectl get events
```

### 5. 查看 kubectl 配置：

``` BASH
kubectl config view
```

## 4、创建 Service

### 默认情况下，Pod 只能通过 Kubernetes 集群中的内部 IP 地址访问。 要使得 `hello-node` 容器可以从 Kubernetes 虚拟网络的外部访问，你必须将 Pod 暴露为 Kubernetes Service。

### 1. 使用 kubectl expose 命令将 Pod 暴露给公网：

``` BASH
kubectl expose deployment hello-node --type=LoadBalancer --port=8080
```

这里的 `--type=LoadBalancer` 标志表明你希望将你的 Service 暴露到集群外部。

### 2. 查看你刚刚创建的 Service：

``` BASH
kubectl get services
```

输出结果类似于这样:

``` BASH
NAME         TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
hello-node   LoadBalancer   10.108.144.78   <pending>     8080:30369/TCP   21s
kubernetes   ClusterIP      10.96.0.1       <none>        443/TCP          23m
```

对于支持负载均衡器的云服务平台而言，平台将提供一个外部 IP 来访问该服务。 在 Minikube 上，LoadBalancer 使得服务可以通过命令 `minikube service` 访问。

### 3. 运行下面的命令：

``` BASH
minikube service hello-node
```

### 4. 仅限 Katacoda 环境：单击加号，然后单击 **选择要在主机 1 上查看的端口**。

<br>

### 5. 仅限 Katacoda 环境：请注意在 service 输出中与 `8080` 对应的长度为 5 位的端口号。 此端口号是随机生成的，可能与你的不同。 在端口号文本框中输入你自己的端口号，然后单击显示端口。 对应于上面的例子，需要输入 30369。

这将打开一个浏览器窗口，为你的应用程序提供服务并显示应用的响应。

## 5、启用插件

Minikube 有一组内置的 [插件](https://kubernetes.io/zh/docs/concepts/cluster-administration/addons/)， 可以在本地 Kubernetes 环境中启用、禁用和打开。

### 1. 列出当前支持的插件：

``` BASH
minikube addons list
```

输出结果类似于这样：

``` BASH
addon-manager: enabled
dashboard: enabled
default-storageclass: enabled
efk: disabled
freshpod: disabled
gvisor: disabled
helm-tiller: disabled
ingress: disabled
ingress-dns: disabled
logviewer: disabled
metrics-server: disabled
nvidia-driver-installer: disabled
nvidia-gpu-device-plugin: disabled
registry: disabled
registry-creds: disabled
storage-provisioner: enabled
storage-provisioner-gluster: disabled
```

### 2. 启用插件，例如 `metrics-server` ：

``` BASH
minikube addons enable metrics-server
```

输出结果类似于这样：

``` BASH
metrics-server was successfully enabled
```

### 3. 查看刚才创建的 `Pod` 和 `Service` ：

``` BASH
kubectl get pod,svc -n kube-system
```

输出结果类似于这样：

``` BASH
NAME                                        READY     STATUS    RESTARTS   AGE
pod/coredns-5644d7b6d9-mh9ll                1/1       Running   0          34m
pod/coredns-5644d7b6d9-pqd2t                1/1       Running   0          34m
pod/metrics-server-67fb648c5                1/1       Running   0          26s
pod/etcd-minikube                           1/1       Running   0          34m
pod/influxdb-grafana-b29w8                  2/2       Running   0          26s
pod/kube-addon-manager-minikube             1/1       Running   0          34m
pod/kube-apiserver-minikube                 1/1       Running   0          34m
pod/kube-controller-manager-minikube        1/1       Running   0          34m
pod/kube-proxy-rnlps                        1/1       Running   0          34m
pod/kube-scheduler-minikube                 1/1       Running   0          34m
pod/storage-provisioner                     1/1       Running   0          34m

NAME                           TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)             AGE
service/metrics-server         ClusterIP   10.96.241.45    <none>        80/TCP              26s
service/kube-dns               ClusterIP   10.96.0.10      <none>        53/UDP,53/TCP       34m
service/monitoring-grafana     NodePort    10.99.24.54     <none>        80:30002/TCP        26s
service/monitoring-influxdb    ClusterIP   10.111.169.94   <none>        8083/TCP,8086/TCP   26s
```

### 4. 禁用 `metrics-server` ：

``` BASH
minikube addons disable metrics-server
```

输出结果类似于这样：

``` BASH
metrics-server was successfully disabled
```

## 6、清理

现在可以清理你在集群中创建的资源：

``` BASH
kubectl delete service hello-node
kubectl delete deployment hello-node
```

可选地，停止 Minikube 虚拟机（VM）：

``` BASH
minikube stop
```

可选地，删除 Minikube 虚拟机（VM）：

``` BASH
minikube delete
```
