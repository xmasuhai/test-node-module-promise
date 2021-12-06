# 事件循环机制EventLoop

## 大纲链接<a id="catalogue" href="#catalogue" > § </a>

[toc]

---

> JS是单线程语言，同一时间只能做一键事情

- 单线程执行任务队列：如果前一个任务非常好事，则后续任务必须一致等待，从而导致程序假死

> 同步任务和异步任务

- 为防止某个耗时任务导致程序假死，JS将执行的任务分为两类

1. 同步任务 `synchronous`

- 又称为**非耗时任务**，指的是在主线程上排队执行的任务
- 只有前一个任务执行完毕，才能执行后一个任务

2. 异步任务 `asynchronous`

- 又称为**耗时任务**，异步任务由JS委托给 **宿主环境(浏览器/Node.js)** 进行执行
- 当异步任务执行完成后，会通知JS主线程执行异步任务的**回调函数**

## 同步任务和异步任务的执行过程

![EventLoop](https://note.youdao.com/yws/api/personal/file/7D81B05F59394FDD891F6E8DC3FF95CB?method=download&shareKey=decef8572d95a3a90b105afc7ac1a10e)

- 同步任务由JS主线程依次执行
- 异步任务委托给宿主环境执行
- 已完成的异步任务**对应的回调函数**，会被加入到**任务队列**中等待执行
- JS主线程的**执行栈**被清空后，会依次读取任务队列中的回调函数放到执行栈中执行
- JS主线程不断重复以上4步

> 补充

- 队列：先进先出 （队列弹药夹）
- 栈：后进先出（薯片栈）

---

## `EventLoop`的概念及经典面试题

> JS主线程中任务队列中读取异步任务的回调函数，放到执行栈中依次执行，这个过程是循环不断的，整个机制又称为 EventLoop 事件循环

### 结合 EventLoop 分析输出的顺序

```js
import thenFs from 'then-fs'

console.log('A')
thenFs.readFile('./files/1.txt', 'utf8')
      .then((dataStr) => {
        console.log('B')
    })
setTimeout(() => {
  console.log('C')
}, 0)
console.log('D')

// ADCB
// sycn AD
// setTimeout 0 C
// readFile cost time then B
```

> 分析

- A D 属于同步任务，根据代码的先后顺序依次被执行
- `thenFs.readFile`异步任务，具体为** `I/O`任务**，属于宏任务，委托给宿主环境执行
- `setTimeout` 异步任务，委托给宿主环境执行
- `thenFs.readFile`消耗耗一定的时间后将回调函数放入任务队列，`setTimeout` 延迟 0，立即将回调放入任务队列
- 读文件的过程不可能是0秒，最快也是几毫秒，这样就慢于`setTimeout`执行完毕
- `I/O`任务和setTimeout同样是宏任务，按先来顺序执行，但B是在IO宏任务里面的promise微任务里面打印的,所以应该先打印C
- 任务队列先进先出，首先执行的是`setTimeout`的回调函数，后执行的是`thenFs.readFile`的回调函数

> 总结

- IO任务和setTimeout同样是宏任务，按先来顺序执行，IO宏任务里面的 微任务 promise
- **异步任务操作的耗时**影响着其回调函数被**加入到任务队列的先后顺序**
  - `setTimeout`耗时由第二个参数决定
  - `thenFs.readFile`耗时不定

---

## 宏任务与微任务的概念

> JS将异步任务（耗时任务）又做了进一步的划分，异步任务又分为：

- 宏任务 `macrotask`
  - 异步的`Ajax`请求
  - 定时`setTimeout`、`setInterval`
  - 文件操作，即 `I/O` 操作
  - 其他
- 微任务 `microtask`
  - `Promise.then()`、`.catch()`和`.finally()`；`Promise.all()`、`Promise.any()`、`Promise.allSettled()`、`Promise.race()`等
  - `process.nextTick`(Node.js)
  - 其他

> 实例化 Promise 实例中的回调函数为同步任务

![order](https://note.youdao.com/yws/api/personal/file/AD8B5BF7483D430085A489ECF5DE0B79?method=download&shareKey=35a302a5b0bcc985868f53aec8db447d)

- 每一个宏任务执行完之后，都会检查**是否存在待执行的微任务**，如果有，则执行完所有微任务之后，再继续执行下一个宏任务
- 宏任务和微任务是**交替执行的**

---

## 举例分析宏任务和微任务的执行过程

```js
// macrotask
setTimeout(() => {console.log('4')})
// synchronous
new Promise(function (resolve) {
  console.log('1')
  resolve()
})
  // microtask
  .then(() => {console.log('3')})
// synchronous
console.log('2')

```

- 将`setTimeout`放到宏任务队列
- 执行同步任务`new Promise(function (resolve) {})`
- 将`.then()`放到微任务队列
- 执行同步任务`console.log('2')`
- 执行微任务队列中所有微任务`.then()`
- 执行下一个宏任务`setTimeout`

---

## 异步经典面试题

### 第一题：

```js
// declaration
async function async1() {
  console.log('async1 start')
  await async2()
  // microtask A
  console.log('async1 end')
}
async function async2() {
  console.log('async2')
}
// run code
console.log('script start')
// setTimeout A
setTimeout(function () {
  console.log('setTimeout')
}, 0)
// sync A
async1()
// sync B
new Promise(function (resolve) {
  console.log('promise1')
  resolve()
})
// then A
  .then(function () {
    console.log('promise2')
  })
console.log('script end')

/*
- 执行栈
  - console.log('script start'); // sync code
  - console.log('async1 start'); // sync code in async1
  - console.log('async2'); // sync code in async2
  - console.log('promise1'); // sync code
  - console.log('script end'); // sync code
  - console.log('async1 end'); // microtask A in async1
  - console.log('promise2'); // then A
  - console.log('setTimeout'); // sync code in setTimeout A

- 微任务队列
  -[x] microtask A in async1
  -[x] then A

- 宏任务队列
  -[x] setTimeout A

* */

```

- `async function xxx() {}` 异步函数中，关键字`await`第一次出现之前的语句，为**同步执行**，包括 **首个`await`** 修饰的语句也是**同步执行**
- **首个`await`** 语句之后的代码为异步执行，为微任务，依次添加到微任务队列
- `new Promise(function (resolve) {})` Promise 实例化语句中的回调函数 `function (resolve) {}`是同步执行
- `.then()` 的回调函数为异步执行，添加到微任务队列
- 将语句的类型分为同步还是异步，异步又分为宏任务或微任务

> 解异步执行顺序题的公式：

1. 执行栈
2. 微任务队列
3. 宏任务队列

> 按照代码顺序将相应类型的语句依次添加到 **执行栈->微任务队列->宏任务队列**
>
> 依次执行 **执行栈中的语句->微任务队列中的语句->宏任务队列中的语句**

### 第二题：

```js
// sync
console.log('1')
// setTimeout A
setTimeout(function() {
  console.log('2')
  new Promise(function(resolve) {
    console.log('3')
    resolve()
  })
    // then B
    .then(function() {
      console.log('4')
    })
}, 0)
// sync
new Promise(function(resolve) {
  console.log('5')
  resolve()
})
  // then A
  .then(function() {
    console.log('6')
  })
// setTimeout B
setTimeout(function() {
  console.log('7')
  new Promise(function(resolve) {
    console.log('8')
    resolve()
  })
    // then C
    .then(function() {
      console.log('9')
    })
}, 0)

/*
- 执行栈
  - console.log('1') // sync
  - console.log('5') // sync
  - console.log('6') // then A
  - console.log('2') // sync in setTimeout A
  - console.log('3') // sync in setTimeout A
  - console.log('4') // then B
  - console.log('7') // sync in setTimeout B
  - console.log('8') // sync in setTimeout B
  - console.log('9') // then C

- 微任务队列
  -[x] then A
  -[x] then B
  -[x] then C

- 宏任务队列
  -[x] setTimeout A
  -[x] setTimeout B

* */

```

---

---

<!-- Article End -->

<div style="text-align:center;">·未完待续·</div>

---

#### 参考文章

- 无

#### 相关文章

- 无

---

- 作者： Joel
- 文章链接：
- [版权声明](http://xmasuhai.xyz/posts/版权声明链接/)
- 非自由转载-非商用-非衍生-保持署名
- <a style='color:#DB2D5D;' href='https://xiedaimala.com/bbs/users/8c266e6f-55a2-4348-a180-17cb8cdb2c46#/?page=1' target='_blank' rel='noreferrer noopener'>河</a>
  <a style='color:#006CFF;' href='https://juejin.im/user/59abfad26fb9a0248f4aa221' target='_blank' rel='noreferrer noopener'>掘</a>
  <a style='color:#009A61;' href='https://segmentfault.com/u/joel_59b17eb9d2155' target='_blank' rel='noreferrer noopener'>思</a>
  <a style='color:#0084FF;' href='https://www.zhihu.com/people/xue-shou-41/posts' target='_blank' rel='noreferrer noopener'>知</a>
  <a style='color:#EA6F5A;' href='https://www.jianshu.com/u/079916729823' target='_blank' rel='noreferrer noopener'>简</a>

---

---
