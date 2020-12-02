## 前言

Vue3的[release版本](https://github.com/vuejs/vue-next)终于发布了，新的Vue3在语法以及底层都进行了全新的重构，带来了更快的运行速度，更小的构建包，更友好的编程规范。

## 更快

传统的虚拟dom算法：

组件patch的时候，需要重新创建整个vdom树，然后遍历整棵树进行diff，update...

更快的虚拟dom算法，源自编译模板时给予更多的运行时提示：

1.  编译模板时对动态内容进行patch标记，告诉patch算法只关注被标记的动态部分

[![5](https://user-images.githubusercontent.com/44472735/100687852-096def80-33bc-11eb-9ec8-91ce8a8f3856.png)](https://user-images.githubusercontent.com/44472735/100687852-096def80-33bc-11eb-9ec8-91ce8a8f3856.png)

1.  对静态内容进行静态提升（变量提升），只在页面初始化时创建并渲染一次，其余时候不再渲染

[![4](https://user-images.githubusercontent.com/44472735/100687876-14288480-33bc-11eb-8008-114fa34b397e.png)](https://user-images.githubusercontent.com/44472735/100687876-14288480-33bc-11eb-8008-114fa34b397e.png)

1.  对事件监听函数进行缓存，防止内联监听函数带来的副作用

开启缓存前：

[![3](https://user-images.githubusercontent.com/44472735/100687895-1ab6fc00-33bc-11eb-8d5a-c66d24433dac.png)](https://user-images.githubusercontent.com/44472735/100687895-1ab6fc00-33bc-11eb-8d5a-c66d24433dac.png)

开启缓存后：

[![2](https://user-images.githubusercontent.com/44472735/100687917-24406400-33bc-11eb-9d19-e534a26804e9.png)](https://user-images.githubusercontent.com/44472735/100687917-24406400-33bc-11eb-9d19-e534a26804e9.png)

......

从在线模板编译器中编辑并查看新变化 =>[模板编译器](https://vue-next-template-explorer.netlify.app)

## 更小

### 全局API的使用

全局 API 现在只能作为 ES 模块构建的命名导出进行访问。

#### Vue2的使用方式

Vue.nextTick（this.$nextTick）、Vue.set、Vue.delete ...

#### Vue3的使用方式

import { nextTick, set, delete, ... } from 'vue';

nextTick(() => {// dosomething});  
......

### 内部组件与helper的使用

当在模板中使用到transtion组件、keepAlive组件、 ...

经complier编译后，生成

import { transtion, keepAlive, ... } from 'vue'

当在模板中使用到v-show、v-model...

complier编译后，生成

import { vShow, vModel ... } from 'vue'

意味着只有在应用程序实际使用了某个API或者组件的时候才会导入它。没有使用到的功能代码将不会出现在最终的构建包中。框架体积进一步缩小。

## 更友好？

#### VUE2组件现存的缺陷

1.  组件越来越大，可读性和可维护性越来越差。根本原因在于Vue使用的option API：必须按配置(options)来组织代码，你需要把一个功能的实现分布在各个配置里：data，computed，watcher，methods，但是在某些情况下按功能来组织代码更合理。如果要在一个很大的组件中修改一个功能，就要跳到各个属性找，如果组件里面还用了mixins，还得跳文件看

2.  mixins无法特别好的在多个组件中复用同一段代码  
    mixins有什么问题？  
    可读性太差，得跳到mixins所在的文件中才能知道它到底有什么  
    不同的mixins容易冲突  
    复用其他同伴的mixins的时候，有些代码不合自己的预期，但是不能随意更改

3.  对typeScript的支持有限

#### 使用componsition API

什么时候使用componsition API？

[![1](https://user-images.githubusercontent.com/44472735/100687826-fc510080-33bb-11eb-9952-119868276697.png)](https://user-images.githubusercontent.com/44472735/100687826-fc510080-33bb-11eb-9952-119868276697.png)

1.  如果你有一个很大的组件，想要按功能来聚合代码。
2.  如果你想要复用组件的一部分代码。
3.  如果你想要更好地支持typeScript

<div class="highlight highlight-source-js">

<pre><span class="pl-k">import</span> <span class="pl-s1">useFeature1</span> <span class="pl-k">from</span> <span class="pl-s">'../use/useFeature1'</span><span class="pl-kos">;</span>
<span class="pl-k">import</span> <span class="pl-s1">useFeature2</span> <span class="pl-k">from</span> <span class="pl-s">'../use/useFeature2'</span><span class="pl-kos">;</span>

<span class="pl-k">export</span> <span class="pl-k">default</span> <span class="pl-kos">{</span>
  <span class="pl-en">setup</span><span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
    <span class="pl-k">const</span> <span class="pl-kos">{</span> data1<span class="pl-kos">,</span> data2<span class="pl-kos">,</span> method1<span class="pl-kos">,</span> computed1<span class="pl-kos">,</span> ... <span class="pl-kos">}</span> <span class="pl-c1">=</span> <span class="pl-en">useFeature1</span><span class="pl-kos">(</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
    <span class="pl-k">const</span> <span class="pl-kos">{</span> data3<span class="pl-kos">,</span> data4<span class="pl-kos">,</span> method2<span class="pl-kos">,</span> computed2<span class="pl-kos">,</span> ... <span class="pl-kos">}</span> <span class="pl-c1">=</span> <span class="pl-en">useFeature2</span><span class="pl-kos">(</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
    <span class="pl-c">// do something</span>
    <span class="pl-k">return</span> <span class="pl-kos">{</span> data1<span class="pl-kos">,</span> data2<span class="pl-kos">,</span> method1<span class="pl-kos">,</span> ... <span class="pl-kos">}</span><span class="pl-kos">;</span>
  <span class="pl-kos">}</span>
<span class="pl-kos">}</span></pre>

</div>

上面这段代码是compsition API的一种示例，它做到了：按功能组织代码，想要修改某个业务逻辑时，不需要满大街找散布各地的数据和方法了，响应式属性与组件解耦，自由控制需要成为响应式的以及需要暴露给模板的属性。

setup内的代码只依赖于传入的参数和全局引入的Vue API，而不是特殊修改过的`this`。所以只需要导出你想要复用的功能函数。甚至可以导出整个`setup`函数去实现“类似”继承的效果。

#### 两种创建响应式属性的API

##### ref: 为传入的值封装一个响应式对象，通过value属性访问与设置对象的值

<div class="highlight highlight-source-js">

<pre><span class="pl-en">setup</span><span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
  <span class="pl-k">const</span> <span class="pl-s1">capacity</span> <span class="pl-c1">=</span> <span class="pl-en">ref</span><span class="pl-kos">(</span><span class="pl-c1">3</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-k">const</span> <span class="pl-s1">attending</span> <span class="pl-c1">=</span> <span class="pl-en">ref</span><span class="pl-kos">(</span><span class="pl-kos">[</span><span class="pl-s">'tim'</span><span class="pl-kos">,</span> <span class="pl-s">'Bob'</span><span class="pl-kos">,</span> <span class="pl-s">'Joe'</span><span class="pl-kos">]</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-en">watch</span><span class="pl-kos">(</span><span class="pl-s1">capacity</span><span class="pl-kos">,</span> <span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-c1">=></span> <span class="pl-kos">{</span>
    <span class="pl-smi">console</span><span class="pl-kos">.</span><span class="pl-en">log</span><span class="pl-kos">(</span><span class="pl-s">'capacity changed!'</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-kos">}</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-en">watch</span><span class="pl-kos">(</span><span class="pl-s1">attending</span><span class="pl-kos">,</span> <span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-c1">=></span> <span class="pl-kos">{</span>
    <span class="pl-smi">console</span><span class="pl-kos">.</span><span class="pl-en">log</span><span class="pl-kos">(</span><span class="pl-s">'attending changed!'</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-kos">}</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-en">onMounted</span><span class="pl-kos">(</span><span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-c1">=></span> <span class="pl-kos">{</span>
    <span class="pl-s1">capacity</span><span class="pl-kos">.</span><span class="pl-c1">value</span> <span class="pl-c1">+=</span> <span class="pl-c1">1</span><span class="pl-kos">;</span> <span class="pl-c">// capacity changed!</span>
    <span class="pl-s1">attending</span><span class="pl-kos">.</span><span class="pl-c1">value</span><span class="pl-kos">[</span><span class="pl-c1">0</span><span class="pl-kos">]</span> <span class="pl-c1">=</span> <span class="pl-s">'Jack'</span><span class="pl-kos">;</span> <span class="pl-c">// ?</span>
    <span class="pl-c">// 通过ref封装的响应式对象无法进行深层监听</span>
  <span class="pl-kos">}</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-k">return</span> <span class="pl-kos">{</span> capacity <span class="pl-kos">}</span><span class="pl-kos">;</span>
<span class="pl-kos">}</span></pre>

</div>

##### reactive: 让传入的对象成为响应式对象

<div class="highlight highlight-source-js">

<pre><span class="pl-en">setup</span><span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
  <span class="pl-k">const</span> <span class="pl-s1">event</span> <span class="pl-c1">=</span> <span class="pl-en">reactive</span><span class="pl-kos">(</span><span class="pl-kos">{</span>
    <span class="pl-c1">capacity</span>: <span class="pl-c1">3</span><span class="pl-kos">,</span>
    <span class="pl-c1">attending</span>: <span class="pl-kos">[</span><span class="pl-s">'tim'</span><span class="pl-kos">,</span> <span class="pl-s">'Bob'</span><span class="pl-kos">,</span> <span class="pl-s">'Joe'</span><span class="pl-kos">]</span><span class="pl-kos">,</span>
  <span class="pl-kos">}</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-en">watch</span><span class="pl-kos">(</span><span class="pl-s1">event</span><span class="pl-kos">,</span> <span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-c1">=></span> <span class="pl-kos">{</span>
    <span class="pl-smi">console</span><span class="pl-kos">.</span><span class="pl-en">log</span><span class="pl-kos">(</span><span class="pl-s">'something changed!'</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-kos">}</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-en">onMounted</span><span class="pl-kos">(</span><span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-c1">=></span> <span class="pl-kos">{</span>
    <span class="pl-s1">event</span><span class="pl-kos">.</span><span class="pl-c1">attending</span><span class="pl-kos">[</span><span class="pl-c1">0</span><span class="pl-kos">]</span> <span class="pl-c1">=</span> <span class="pl-s">'Jack'</span><span class="pl-kos">;</span> <span class="pl-c">// something changed!</span>
  <span class="pl-kos">}</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-k">return</span> <span class="pl-kos">{</span> event <span class="pl-kos">}</span><span class="pl-kos">;</span>
<span class="pl-kos">}</span></pre>

</div>

Vue3的响应式监听的实现方式与Vue2有很大不同，并挣脱了Vue2中无法监听动态增加对象属性与数组元素直接赋值的束缚。

点这里查看[简略版本的新响应式监听实现](https://github.com/LaiTaoGDUT/learnVue3/blob/master/public/reactive.html)

#### 其他API

##### watchEffect

<div class="highlight highlight-source-js">

<pre><span class="pl-en">setup</span><span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
  <span class="pl-k">const</span> <span class="pl-s1">capacity</span> <span class="pl-c1">=</span> <span class="pl-en">ref</span><span class="pl-kos">(</span><span class="pl-c1">3</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-k">const</span> <span class="pl-s1">attending</span> <span class="pl-c1">=</span> <span class="pl-en">ref</span><span class="pl-kos">(</span><span class="pl-kos">[</span><span class="pl-s">'tim'</span><span class="pl-kos">,</span> <span class="pl-s">'Bob'</span><span class="pl-kos">,</span> <span class="pl-s">'Joe'</span><span class="pl-kos">]</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-k">const</span> <span class="pl-s1">stop</span> <span class="pl-c1">=</span> <span class="pl-en">watchEffect</span><span class="pl-kos">(</span><span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-c1">=></span> <span class="pl-kos">{</span>
    <span class="pl-smi">console</span><span class="pl-kos">.</span><span class="pl-en">log</span><span class="pl-kos">(</span><span class="pl-s1">capacity</span><span class="pl-kos">.</span><span class="pl-c1">value</span> <span class="pl-c1">+</span> <span class="pl-s1">attending</span><span class="pl-kos">.</span><span class="pl-c1">value</span><span class="pl-kos">.</span><span class="pl-c1">length</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-kos">}</span><span class="pl-kos">)</span>
  <span class="pl-en">onMounted</span><span class="pl-kos">(</span><span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-c1">=></span> <span class="pl-kos">{</span>
    <span class="pl-s1">capacity</span><span class="pl-kos">.</span><span class="pl-c1">value</span> <span class="pl-c1">+=</span> <span class="pl-c1">1</span><span class="pl-kos">;</span> <span class="pl-c">// 7</span>
  <span class="pl-kos">}</span><span class="pl-kos">)</span><span class="pl-kos">;</span>
  <span class="pl-k">return</span> <span class="pl-kos">{</span> capacity<span class="pl-kos">,</span> attending<span class="pl-kos">,</span> stop <span class="pl-kos">}</span><span class="pl-kos">;</span>
<span class="pl-kos">}</span>
<span class="pl-en">stop</span><span class="pl-kos">(</span><span class="pl-kos">)</span><span class="pl-kos">;</span> <span class="pl-c">// 停止监听</span></pre>

</div>

[更多API请参考官方文档](https://vue3js.cn/docs/zh/api/)

#### compisition API的下一步

##### 现存的缺点

1.  ref和reactive太像了，初上手时很难决定到底用哪个。
2.  没有了options的限制，一不小心就可能会写出比使用option API更加臃肿难读的代码
3.  使用Composition API时，需要区分哪些值或者对象是响应式的，哪些不是。
4.  阅读或者修改ref会有点麻烦，因为必须通过`.value`才能实现。
5.  一旦组件需要使用的数据多起来，import和return语句就会很冗长。

##### 下一步

[New script setup and ref sugar](https://github.com/vuejs/rfcs/pull/222)

前阵子，Vue3.0提出了两个新提案，分别为script-setup提案与ref-suger提案

对于以下源代码：

<div class="highlight highlight-source-js">

<pre><span class="pl-c1"><</span><span class="pl-ent">script</span><span class="pl-c1">></span>
import <span class="pl-kos">{</span> <span class="pl-s1">ref</span> <span class="pl-kos">}</span> from 'vue'

export default <span class="pl-kos">{</span>
  <span class="pl-en">setup</span><span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-kos">{</span>
    const <span class="pl-s1">count</span> <span class="pl-c1">=</span> <span class="pl-en">ref</span><span class="pl-kos">(</span><span class="pl-c1">1</span><span class="pl-kos">)</span>
    <span class="pl-k">const</span> <span class="pl-s1">inc</span> <span class="pl-c1">=</span> <span class="pl-kos">(</span><span class="pl-kos">)</span> <span class="pl-c1">=></span> <span class="pl-kos">{</span> <span class="pl-s1">count</span><span class="pl-kos">.</span><span class="pl-c1">value</span><span class="pl-c1">++</span> <span class="pl-kos">}</span>

    <span class="pl-k">return</span> <span class="pl-kos">{</span> count<span class="pl-kos">,</span> inc <span class="pl-kos">}</span>
  <span class="pl-kos">}</span>
<span class="pl-kos">}</span>
<span class="pl-c1"><</span>/<span class="pl-ent">script</span><span class="pl-c1">></span></pre>

</div>

**使用script-setup 提案，将 options.setup 提取到代码顶层，所有顶层声明默认导出为模板使用**

<div class="highlight highlight-source-js">

<pre><span class="pl-c1"><</span><span class="pl-ent">script</span> <span class="pl-c1">setup</span><span class="pl-c1">></span>
import <span class="pl-kos">{</span> <span class="pl-s1">ref</span> <span class="pl-kos">}</span> from 'vue'

const count = ref(0)
const inc = () =<span class="pl-c1">></span> <span class="pl-kos">{</span> <span class="pl-s1">count</span><span class="pl-kos">.</span><span class="pl-c1">value</span><span class="pl-c1">++</span> <span class="pl-kos">}</span>
<span class="pl-c1"><</span>/<span class="pl-ent">script</span><span class="pl-c1">></span></pre>

</div>

**使用ref-sugar 提案，将 ref.value 的写法，做进一步简化，放弃[标记语句](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/label)的普通语法，将其作为ref声明的语法糖。**

<div class="highlight highlight-source-js">

<pre><span class="pl-c1"><</span><span class="pl-ent">script</span> <span class="pl-c1">setup</span><span class="pl-c1">></span>
ref: count = 1
const inc = () =<span class="pl-c1">></span> <span class="pl-kos">{</span> <span class="pl-s1">count</span><span class="pl-c1">++</span> <span class="pl-kos">}</span><span class="pl-c"></span>
<span class="pl-c">// 通过添加$前缀来访问响应式对象</span>
console.log($count.value)
<span class="pl-c1"><</span>/<span class="pl-ent">script</span><span class="pl-c1">></span></pre>

</div>

这是Vue3带来的小改进还是大挑战 ？

## 其他变化

#### 不再支持keyCode修饰

<div class="highlight highlight-source-js">

<pre><span class="pl-c1"><</span><span class="pl-ent">input</span> <span class="pl-s1">v-on</span>:<span class="pl-s1">keyup</span><span class="pl-c1">.13</span><span class="pl-c1">=</span><span class="pl-s">"handleEnter"</span><span class="pl-c1">></span><span class="pl-c1"><</span>/<span class="pl-ent">input</span><span class="pl-c1">></span></pre>

</div>

替换为

<div class="highlight highlight-source-js">

<pre><span class="pl-c1"><</span><span class="pl-ent">input</span> <span class="pl-s1">v-on</span>:<span class="pl-s1">keyup</span>:<span class="pl-c1">enter</span><span class="pl-c1">=</span><span class="pl-s">"handleEnter"</span><span class="pl-c1">></span><span class="pl-c1"><</span>/<span class="pl-ent">input</span><span class="pl-c1">></span></pre>

</div>

#### 过渡类名变更

.v-enter => .v-enter-from

.v-leave => .v-leave-from

#### v-model变更

可使用多个v-model, 不再需要.sync修饰符来进行双向绑定了

<div class="highlight highlight-source-js">

<pre><span class="pl-c1"><</span><span class="pl-ent">ChildComponent</span> <span class="pl-s1">v-model</span>:<span class="pl-s1">title</span><span class="pl-c1">=</span><span class="pl-s">"pageTitle"</span> /<span class="pl-c1">></span></pre>

</div>

相当于

<div class="highlight highlight-source-js">

<pre><span class="pl-c1"><</span><span class="pl-v">ChildComponent</span> :<span class="pl-s1">title</span><span class="pl-c1">=</span><span class="pl-s">"pageTitle"</span> @<span class="pl-s1">update</span>:<span class="pl-s1">title</span><span class="pl-c1">=</span>"<span class="pl-s1">pageTitle</span> <span class="pl-c1">=</span> <span class="pl-s1">$event</span>" /></pre>

</div>

#### 更多

Vue认为$ on，$ off 和 $once 实例方法不应该由它来提供，因此Vue3将它们移除了

过滤器filters被移除了，需要使用计算属性或方法来代替

新增Suspence组件 => 组件loading完成前显示后备内容

新增teleport组件（portal） => 允许传送组件内容到根节点以外的任何地方  
...