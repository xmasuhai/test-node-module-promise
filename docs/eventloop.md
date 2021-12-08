# 事件循环机制EventLoop

> Event Loop 即事件循环，是浏览器或Node解决**单线程运行不阻塞**的一种机制

## 大纲链接<a id="catalogue" href="#catalogue" > § </a>

[toc]

---

## 进程和线程

- 浏览器打开一个页面就相当于开一个进程
- 在进程中可以同时做很多事情，每一个事情都有一个“线程”去处理
- 所以一个进程中可包含多个线程

### 浏览器中的多线程

> 浏览器中一般包含以下线程：

- GUI 渲染线程：渲染页面 & 绘制图形
  - 绘制页面，解析HTML、CSS，构建DOM树等
  - 页面的重绘和重排
  - 与JS引擎互斥(JS引擎阻塞页面刷新)
- JS引擎线程：渲染和解析JS代码
  - js脚本代码执行
  - 负责执行准备好的事件（任务队列中），例如定时器计时结束或异步请求成功且正确返回的回调
  - 与GUI渲染线程互斥
- 事件触发线程：监听事件触发
  - 当对应的事件满足触发条件，将事件添加到js的任务队列末尾
  - 多个事件加入任务队列需要排队等待
- 定时触发器线程：给定时器计时
  - 负责执行异步的定时器类事件：setTimeout、setInterval等
  - 浏览器定时计时由该线程完成，计时完毕后将事件添加至任务队列队尾，等待主线程执行
- 异步HTTP请求线程：基于HTTP网络从服务器端获取资源和信息
  - 负责异步请求
  - 当监听到异步请求状态变更时，如果存在回调函数，该线程会将回调函数加入到任务队列队尾
- WebWorker等

## JS事件循环机制

> 浏览器是多线程的，异步任务借助浏览器的线程和JavaScript的执行机制实现

- JS是单线程语言，浏览器只分配一个线程“JS引擎线程”用来解析运行JS代码，同一时间只能做一件事情
- 单线程执行任务队列：如果前一个任务非常耗时，则后续任务必须一致等待，从而导致程序假死

### 同步任务和异步任务执行顺序

#### 同步与异步

> 计算机领域中的同步与异步和中文翻译的同步和异步正好相反
>
> 计算机中的同步是连续性的动作，上一步未完成前，下一步会发生堵塞，直至上一步完成后，下一步才可以继续执行

- 为防止某个耗时任务导致程序假死，JS将执行的任务分为两类

1. 同步任务 `synchronous`

- 又称为**非耗时任务**，指的是**在主线程上排队执行的任务**
- 只有前一个任务执行完毕，才能执行后一个任务，即按代码顺序执行

2. 异步任务 `asynchronous`

- 又称为**耗时任务**，异步任务由JS委托给 **宿主环境(浏览器/Node.js)** 进行执行
- 异步任务首先到 Event Table 进行回调函数注册
- 当异步任务的触发条件满足，将回调函数从Event Table 压入 Event Queue 中

### 同步任务和异步任务的执行过程

![EventLoop](https://note.youdao.com/yws/api/personal/file/7D81B05F59394FDD891F6E8DC3FF95CB?method=download&shareKey=decef8572d95a3a90b105afc7ac1a10e)

- 同步任务由JS主线程依次执行
- 异步任务委托给宿主环境执行
- 已完成的异步任务**对应的回调函数**，会被加入到**任务队列**中等待执行
- JS主线程的**执行栈**清空后（当前的同步任务执行完成），会依次读取任务队列中的回调函数，放到执行栈中执行（即通知JS主线程执行 Event Queue 中**回调函数**）
- 只要主线程空了，就会去 Event Queue 读取回调函数
- JS主线程不断重复以上步骤，这个过程被称为 Event Loop

> 举例

- `setTimeout(cb, 1000)`，当1000ms后，就将cb压入 Event Queue
- `ajax(请求条件, cb)`，当http请求发送成功后，cb压入 Event Queue

> 补充

- 队列：先进先出 （队列弹药夹）
- 栈：后进先出（薯片栈）

---

> JavaScript的异步任务是存在优先级的

## 宏任务与微任务的概念

> 除了广义上将任务划分为同步任务和异步任务（耗时任务），异步任务又进一步分为宏任务和微任务：

- 异步宏任务 `macrotask`
  - **异步的数据请求: `Ajax/Fetch`**
  - 定时`setTimeout/setInterval`
  - 文件操作，即 `I/O` 操作
  - 事件绑定/队列
  - MessageChannel
  - setImmediate[NODE]
  - history traversal任务（h5当中的历史操作）
  - 其他
- 异步微任务 `microtask`
  - `Promise.then()`、`.catch()`和`.finally()`；`Promise.all()`、`Promise.any()`、`Promise.allSettled()`、`Promise.race()`等
  - **`async/await`**
  - `queueMicrotask`
  - `MutationObserver`（h5新增，用来监听DOM节点变化的）
  - `IntersectionObserver`
  - **`requestAnimationFrame`**
  - `process.nextTick`(Node.js)
  - 其他

> **实例化 new Promise(Cb) 实例中的回调函数Cb为同步任务**

---

### 总结 Event Loop 执行过程

![Event Loop的执行顺序图](https://note.youdao.com/yws/api/personal/file/AD8B5BF7483D430085A489ECF5DE0B79?method=download&shareKey=35a302a5b0bcc985868f53aec8db447d)

> 注意事项

- 每一个宏任务执行完之后，都会检查**是否存在待执行的微任务**，如果有，则执行完所有微任务之后，再继续执行下一个宏任务
- 宏任务和微任务是**交替执行的**
- 宏任务和微任务分别有各自的任务队列 Event Queue，即宏任务队列和微任务队列

> 执行过程

1. 代码开始执行，创建一个全局调用栈，script 作为宏任务执行
2. 执行过程过同步任务立即执行，异步任务根据异步任务类型分别注册到**微任务队列**和**宏任务队列**
3. 同步任务执行完毕，查看微任务队列
4. 若存在微任务，将微任务队列全部执行(包括**执行微任务过程中产生的新微任务**)
5. 若无微任务，查看宏任务队列，执行第一个宏任务，宏任务执行完毕，查看微任务队列，重复上述操作，直至宏任务队列为空

---

## 举例分析宏任务和微任务的执行过程

> 示例

```js
// Promise.resolve 返回一个带着给定值 解析过的 Promise 对象
// 如果参数本身就是一个 Promise 对象，则直接返回这个 Promise 对象
let p1 = Promise.resolve(100)

console.log('p1', p1) // p1 Promise {<fulfilled>: 100}

let p2 = p1
  // p1.then 时，此处的 onfulfilled 方法放在 Event Queue 中的微任务队列等待执行（@A）
  .then(result => {
    console.log(`成功: ${result}`)
    console.log('p2 1st', p2)
    return result * 10
  })

console.log('p2 2nd', p2) // p2 2nd Promise {<pending>}

p2
  // 此时还不知道 p2 的状态，把 onfulfilled 放在 Event Queue 中的微任务队列等待执行（@B）
  .then(result => {
    console.log(`成功: ${result}`)
    console.log('p2 3rd', p2)
  })

console.log('SYNC END')

// 同步代码结束后，开始执行@A -> 成功：100 ->
// 并且修改 p2 的状态为 成功，值是1000； ->
// 此时 @B 可以执行了 ->
// 把 @B 也放在等待的异步微任务队列中 ->
// 如果没有其他的异步任务执行，这把@B也拿出来执行 ->
// 成功：1000

/*
p1 Promise { 100 }
p2 2nd Promise { <pending> }
SYNC END
成功: 100
p2 1st Promise { <pending> }
成功: 1000
p2 3rd Promise { 1000 }
* */

```

> 基于then返回的 promise 实例的状态和值，主要看 onfulfilled/onrejected 是否执行

- 函数返回的不是 promise 实例：
  - 方法执行不报错，p2 状态是 成功，值即返回值
  - 方法执行报错，则 p2 是失败的，值是报错原因
- 函数返回的是 promise 实例：则这个实例的状态和值决定了 p2 的状态和值

---

> 示例：

```js
let p1 = new Promise((resolve, reject) => {
  console.log(1)
  resolve(100)
  console.log(2)
})
console.log('p1', p1)  // p1 -> Promise {<fulfilled>: 100}
/*
1
2
p1 -> Promise {<fulfilled>: 100}
*/

let p2 = new Promise((resolve, reject) => {
  console.log(1)
  resolve(100) // 会先将 p2 的状态变为 fulfilled
  reject(100) // 之后 p2 的状态不再变化
  console.log(2)
})
console.log('p2', p2)
let p3 = p2.then(()=> console.log('p2', p2))
console.log('p2', p2)
console.log('p3', p3)
/*
1
2
p2 Promise {<fulfilled>: 100}
p2 Promise {<fulfilled>: 100}
p3 Promise {<pending>}
p2 Promise {<fulfilled>: 100}
*/

let p4 = new Promise((resolve, reject) => {
  console.log(1)
  reject(100) // 会先将 p2 的状态变为 rejected
  resolve(100) // 之后 p2 的状态不再变化
  console.log(2)
})
console.log('p4', p4)
// 1
// 2
// p4 Promise {<rejected>: 100}

let p5 = new Promise((resolve, reject) => {
  console.log(1)
  reject(100) // 会先将 p2 的状态变为 rejected
  resolve(100) // 之后 p2 的状态不再变化
  console.log(2)
}).then(() => {console.log('p5', p5)})
console.log('p5', p5)
```

- `new Promise(Cb)` 实参 回调函数：Cb是同步代码，立即执行
- 回调函数：Cb的形参 `resolve` `reject`
  - 一旦执行`resolve()`或`reject()`就会将状态变为对应的`resolved`或`rejected`，不再改变
  - 一般会使用分支语句或者`try..catch..`分别调用`resolve()`、`reject()`

> **调用`resolve()`的时机**，示例：

```js
let p2 = new Promise((resolve /*， reject*/) => {
  // resolve(200) // 同步调用

  // setTimeoutA
  setTimeout(() => {
    /*
    // resolve(p2)
    // 失败:TypeError: Chaining cycle detected for promise #<Promise>
    */
    console.log('p2 inside1', p2)
    // 在宏任务setTimeout中调用成功回调 resolve()
    resolve(200) // 调用成功回调 resolve() 更新实例的状态和值
    // 之后的所有 .then 方法都为宏任务中的微任务，在当前宏任务执行完毕后执行
    console.log('p2 inside2', p2) // p2 inside Promise {<fulfilled>: 200}
  }, 1000)
})

// 此时还不知道 p2 实例的状态
console.log('p2 outside1', p2) // p2 outside Promise {<pending>}

// 异步微任务 thenA
p2.then(
  result => {
    console.log(`成功结果为:${result}`)
    return result
  },
  reason => {
    console.log(`失败原因为:${reason}`)
    return reason
  }
)
  .then(res => {console.log('res', res)})

console.log('p2 outside2', p2)

/*
p2 outside1 Promise { <pending> }
p2 outside2 Promise { <pending> }
p2 inside1 Promise { <pending> }
p2 inside2 Promise {<fulfilled>: 200}
成功结果为:200
res 200
*/

```

- 在同步代码中调用 `resolve()`，之后的 .then 方法都为微任务，按顺序添加到微任务队列中
- 在宏任务中调用 `resolve()`，之后的 .then 方法都为宏任务中的微任务，需在**当前宏任务执行之后**，按顺序添加到微任务队列中

> 示例：

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

> 总结影响异步代码执行顺序的因素

1. 同步代码的耗时
2. 异步微任务队列
3. 异步宏任务队列
4. I/O 宏任务之后的微任务 .then()
5. setTimeout 的耗时影响**回调被添加到任务队列的时机**
6. 在 setTimeout 回调函数中调用 resolve()，影响依赖此实例的微任务 .then()

> 加强示例

```js
const sleep = () => {
  return new Promise(resolve => {
    setTimeout(() => {
        return resolve(300)
      },
      1000)
  })
};

;(async () => {
  // await 后面放置的不是一个 Promise 实例
  // 则浏览器默认会把其转换为一个“状态为成功
  // 值就是 await 后的值”的 promise 实例
  let result = await 1 // await Promise.resolve(1)
  console.log('result 1st', result)

  result = await Promise.resolve(2)
  console.log('result 2nd', result)

  result = await sleep()
  console.log('result 3rd', result)
  // 先 sleep 执行
  // 把返回的 promise 实例放在 await 后面等着
  // 当前案例只有 1000ms 后，才能知道实例状态
})()

/*
result 1st 1
result 2nd 2
result 3rd 300
* */

```

- await 需要等待**后面的 promise 实例是状态为成功**时，才会执行之后的代码
- 首先 当前上下文中，await 之后的代码都是**异步微任务** @aw
- 如果已经知道 await 后面的实例状态是成功的话
  - 则 @aw 直接放在Event Queue中，等待执行即可
- 如果 await 后面实例状态是失败的话
  - 则 @aw 在 Web API 中永远不会进入到 Event Queue中，因为永远不会执行
- 如果暂时还不知道是成功还是失败，则 @aw 先放置在 Web API 中
  - 等到知道实例状态是成功后，再挪至到 Event Queue 中等待执行

---

## 总结`EventLoop`的概念及经典面试题

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
- `I/O`任务和setTimeout同样是宏任务，按先来顺序执行，但 B 是在 I/O 宏任务之后的 promise 微任务里面打印的，所以应该先打印C
- 任务队列先进先出，首先执行的是`setTimeout`的回调函数，后执行的是`thenFs.readFile`的回调函数

> 小结

- I/O 任务和 setTimeout 同样是宏任务，按先后顺序执行
- I/O 宏任务里面的 微任务 .then() 需要等待当前宏任务执行完毕，在依次添加到微任务队列中等待执行
- **异步任务操作的耗时**影响着其回调函数被**加入到任务队列的先后顺序**
  - `setTimeout`耗时由第二个参数决定
  - `thenFs.readFile`耗时不定，取决于文件

> 关于 setTimeout 耗时

```js
setTimeout(() => {
    console.log(1);
}, 20);
console.log(2);
setTimeout(() => {
    console.log(3);
}, 10);
console.log(4);
for (let i = 0; i < 90000000; i++) {} // 同步代码耗时 耗时100ms左右
console.log(5);
setTimeout(() => {
    console.log(6);
}, 8);
console.log(7);
setTimeout(() => {
    console.log(8);
}, 15);
console.log(9);

/*
- 同步执行
 - console.log(2);
 - console.log(4);
 - console.log(5);
 - console.log(7);
 - console.log(9);
- Web API 定时器线程
 - console.log(1); 20ms
 - console.log(3); 10ms
 - console.log(6); 8ms + 同步代码耗时
 - console.log(8); 15ms + 同步代码耗时
- 异步队列
  - 异步微任务队列
   - 无
  - 异步宏任务队列
   - console.log(3);
   - console.log(1);
   - console.log(6);
   - console.log(8);
- Event Queue
 - console.log(3);
 - console.log(1);
 - console.log(6);
 - console.log(8);
*/ 
```

- Web API任务事件监听队列，定时器任务，浏览器开始分配一个定时器监听线程，计时完毕，将回调函数放到宏任务队列中
- 多个定时器，第二个参数决定**将回调函数添加到宏任务队列中**的先后顺序
- 定时器第二个参数相同时，则按代码顺序添加
- 一般情况，同步代码的耗时不考虑在内；如果定时器第二个参数为毫秒级别，耗时相近的定时器任务不能确定哪一个先添加到红任务队列中

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

1. 主线程执行栈
2. 微任务队列
3. 宏任务队列
4. Web API 定时器
5. Event Queue

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

### 第三题：

```js
console.log('script start')

// setTimeoutA
setTimeout(() => {
  console.log('time1')
}, 1 * 2000)

Promise.resolve()
  .then(function () {
    console.log('promise1')
  })
  .then(function () {
    console.log('promise2')
  })

async function foo() {
  await bar()
  console.log('async1 end')
}

foo()

async function errorFunc() {
  try {
    await Promise.reject('error!!!') // 将 promise 对象的状态锁定为失败
    // await 之后的代码都是异步执行
  } catch (e) {
    console.log(e) // 异步微任务 相当于promise.catch
  }
  console.log('async1')
  return Promise.resolve('async1 success')
}

errorFunc().then(res => console.log(res))

function bar() {
  console.log('async2 end')
}

console.log('script end')

```

- 重写代码顺序，函数声明提前
  - 声明 async function foo
  - 声明 async function errorFunc
  - 声明 function bar

```js
// 重写代码顺序
async function foo() {
  await bar()
  console.log('async1 end')
}

async function errorFunc() {
  try {
    await Promise.reject('error!!!') // 将 promise 对象的状态锁定为失败
    // await 之后的代码都是异步执行
  } catch (e) {
    console.log(e) // 异步微任务 相当于promise.catch
  }
  console.log('async1')
  return Promise.resolve('async1 success')
}

function bar() {
  console.log('async2 end')
}

console.log('script start')
 
setTimeout(() => {
  console.log('time1')
}, 1 * 2000)

Promise.resolve()
  .then(function () {
    console.log('promise1')
  })
  .then(function () {
    console.log('promise2')
  })

foo()

errorFunc()
  .then(res => console.log(res))

console.log('script end')
```

- 将函数声明带入函数执行位置

```js
console.log('script start')
 
setTimeout(() => {
  console.log('time1')
}, 1 * 2000)

Promise.resolve()
  .then(function () {
    console.log('promise1')
  })
  .then(function () {
    console.log('promise2')
  })

(async function foo() {
  await console.log('async2 end')
  console.log('async1 end')
})()

(async function errorFunc() {
  try {
    await Promise.reject('error!!!') // 将 promise 对象的状态锁定为失败
    // await 之后的代码都是异步执行
  } catch (e) {
    console.log(e) // 异步微任务 相当于promise.catch
  }
  console.log('async1')
  return Promise.resolve('async1 success')
})()
  .then(res => console.log(res))

console.log('script end')

```

> 总结解题顺序

- 使执行顺序更符合人类阅读顺序
- 重写代码顺序
- 将函数声明带入函数执行位置
- **标记每一个 `setTimeoutA B C... ` `thenA B C...`**
- **标记每一个 `setTimeoutA B C... ` `thenA B C...`**
- **标记每一个 `setTimeoutA B C... ` `thenA B C...`**
- setTimeout 添加到 Web API 时，注意第二个参数的耗时，影响添加到异步宏任务队列的先后顺序
- `new Promise(Cb)` 中的回调 Cb 为同步执行
  - Cb 参数的 `resolve`和`reject`执行时机，以`resolve`为例
    - `resolve`同步执行
    - `resolve`异步执行
      - `resolve`在异步微任务
      - `resolve`在异步宏任务

```js
console.log('script start')

// setTimeoutA
setTimeout(() => {
  console.log('time1')
}, 1 * 2000)

Promise.resolve() // 同步 将 promise 对象的状态锁定为成功
  // thenA
  .then(function () {
    console.log('promise1')
  }) // 带 thenB 等待promise的状态改变 运行到此时在第二轮微任务队列末尾添加thenB 的微任务
  // thenB
  .then(function () {
    console.log('promise2')
  })

(async function foo() {
  await console.log('async2 end') // 同步 首个await
  console.log('async1 end') // 添加到异步微任务队列
})()

(async function errorFunc() {
  try {
    await Promise.reject('error!!!') // 同步 将 promise 对象的状态锁定为失败
    // await 之后的代码都是异步执行
  } catch (e) {
    console.log(e) // 捕获错误 console.log(error!!!) 添加到异步微任务队列 相当于 promise.catch
  }
  console.log('async1') // 添加到异步微任务队列
  return Promise.resolve('async1 success') // 异步 将 promise 对象的状态锁定为成功 值为 'async1 success'
})() // 带thenC 运行到此时在第二轮微任务队列末尾添加thenC 的微任务
  // thenC
  .then(res => console.log(res))

console.log('script end')

/*
- 同步
  - console.log('script start');
  - console.log('async2 end')
  - console.log('script end')
- Web API
  - setTimeoutA 2000ms
- 异步
  - 第一轮微任务队列
    - console.log('promise1') // 带 thenB 等待promise的状态改变 运行到此时在第二轮微任务队列末尾添加.then 的微任务
    - console.log('async1 end')
    - console.log('error!!!')
    - console.log('async1') // 带 thenC 等待promise的状态改变 运行到此时在第二轮微任务队列末尾添加.then 的微任务
  - 第二轮微任务队列
    - console.log('promise2') // thenB
    - console.log('async1 success') // thenC
  - 宏任务队列
    - console.log('time1')
* */

/*
console.log('script start');
console.log('async2 end')
console.log('script end')
console.log('promise1')
console.log('async1 end')
console.log('error!!!')
console.log('async1')
console.log('promise2')
console.log('async1 success')
console.log('time1')
* */

/*
script start
async2 end
script end
promise1
async1 end
error!!!
async1
promise2
async1 success
time1
* */
```

---

### 第四题：

```js
// setTimeoutA
setTimeout(() => {
  console.log(1)
}, 0)

const p = new Promise((resolve) => {
  console.log(2)
  // setTimeoutB
  setTimeout(() => {
    // setTimeoutB 宏任务完成之后 才锁定 promise 对象状态为成功
    resolve()
    console.log(3)
  }, 0)
})

// setTimeoutB 宏任务内部执行完成之后 确定 promise 对象状态为成功 再执行 .then
p
  .then(() => {
    console.log(4)
  })

console.log(5)

/*
- 同步
  - console.log(2)
  - console.log(5)
- WEB API
    - setTimeoutA
    - setTimeoutB
- 异步
  - 微
    - 无
  - 宏
    - console.log(1)
    - console.log(3) // setTimeoutB 宏任务完成之后 确定 promise 对象状态为成功 执行 .then
      - 微
        - console.log(4)
* */

/*
2
5
1
3
4
* */

```

---

### 第五题：

```js
const p1 = new Promise(function (resolve) {
  resolve('2') // 同步执行
})

// setTimeoutA
setTimeout(function () {
  console.log('1')
}, 10)

// thenA
p1
  .then(function (value) {
    console.log(value)
  })

// setTimeoutB
setTimeout(function () {
  console.log('3')
}, 0)

/*
- 同步
  -
- Web API
  - setTimeoutA 10ms
  - setTimeoutB 0ms // 先于 setTimeoutA 将回调添加到宏任务队列
- 异步
  - 微任务
    - thenA // console.log(value) // resolve('2') value 为同步执行的结果
      - console.log(2)
  - 宏任务
    - console.log('3')
    - console.log('1')
* */

/*
2
3
1
* */

```

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
