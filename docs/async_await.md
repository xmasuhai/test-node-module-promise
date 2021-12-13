# 异步非全解 async、await

- [代码仓库 test-node-module-promise](https://github.com/xmasuhai/test-node-module-promise)

---

> 大纲链接<a id="catalogue" href="#catalogue" > § </a>

[toc]

---

## 了解`async`和`await`的基本使用<a href="#catalogue"> ⇧ </a>

> `async/await`是 ES8 (ECMAScript 2017)引入的新语法，用来简化 Promise 异步操作
>
> `async`和`await`是 Generator 函数的语法糖
>
> 使用关键字 async 来修饰function或者箭头函数`() => {}`，在函数内部使用 await 来表示等待异部操作的结果

- 在 `async/await` 出现前，开发者只能通过 链式 .then() 的方式处理 Promise 异步操作

```js
import thenFs from 'then-fs'

thenFs.readFile('./files/1.txt', 'utf8')
  .then(rt1 => {
    console.log(rt1)
    return thenFs.readFile('./files/2.txt', 'utf8')
  })
  .then(rt2 => {
    console.log(rt2)
    return thenFs.readFile('./files/3.txt', 'utf8')
  })
  .then(rt3 => {
    console.log(rt3)
  })

```

- .then() 的链式调用解决了回调地狱的问题
- .then() 的链式调用缺点: 代码仍旧冗余、阅读性差，不易理解

---

### `async/await`的基本使用<a href="#catalogue"> ⇧ </a>

```js
import thenFs from 'then-fs'

// 按顺序读取文件1、2、3的内容
async function getAllFiles() {
  const r1 = await thenFs.readFile('./files/1.txt', 'utf8')
  console.log(r1);
  const r2 = await thenFs.readFile('./files/2.txt', 'utf8')
  console.log(r2);
  const r3 = await thenFs.readFile('./files/3.txt', 'utf8')
  console.log(r3);
}

getAllFiles()

```

- 在一个方法返回的 Promise 实例对象前加 `await` 可以直接返回异步的结果
  - 例如直接获取读取文件的内容
  - `const r1 = await thenFs.readFile('./files/1.txt', 'utf8')`
- `await` 的外层函数前必须有 `async` 修饰
- 不再需要使用 .then() 的方法拿到异步结果

### `async/await`注意事项<a href="#catalogue"> ⇧ </a>

- 使用 `async` 声明一个**异步函数**，并**隐式地返回一个Promise**。因此可以直接return变量，无需使用 Promise.resolve 进行转换
- async 函数的**返回值也是一个 Promise 实例**
- 总是与 await 一起使用的。并且，await **只能在 async 函数体内**
- await 是个运算符，用于组成表达式，它会阻塞后面的代码
- 如果await 后等到的是 Promise 对象，则**得到其 resolve 值**。否则，会得到一个表达式的运算结果
- async 函数执行的过程中，一旦遇到 await 就会**先返回 pending(进行中) 状态的 Promise 实例**，等待异步操作有结果之后，继续执行 await 之后的语句
- 语句**全部执行完毕**且**无错误**的情况下，则返回的 Promise 实例会变为已成功，否则会变为已失败
- 和 promise 一样，是**非阻塞的**。但不用写 then 及其回调函数，这会减少代码行数，也避免了代码嵌套
- 所有异步调用，可以写在**同一个代码块**中，无需定义多余的中间变量
- ***使异步代码，在形式上，更接近于同步代码***
- 在 async 方法中，**首个 await 之前**的代码会**同步执行**，首个 await 之后的代码会**异步执行**

```js
import thenFs from 'then-fs'

console.log('sync step A');

export async function getAllFile() {
  console.log('sync step B');
  const r1 = await thenFs.readFile('./files/1.txt', 'utf8')
  const r2 = await thenFs.readFile('./files/2.txt', 'utf8')
  const r3 = await thenFs.readFile('./files/3.txt', 'utf8')
  console.log(r1, r2, r3);
  console.log('async step D');
}

getAllFile();
console.log('sync step C');

// sync step A
// sync step B <-- getAllFile()
// sync step C
// 111 222 333
// async step D

```

> 不要是异步就要去用 async/await，要满足两点，优势才能体现：

- 1️⃣要执行多个异步任务
- 2️⃣并且这些个任务都有前后依赖的关系(比如后者依赖前者的结果)
- 主要就是用来解套，让代码更清晰
- 没有前后依赖那不如用promise了

### 其他使用示例<a href="#catalogue"> ⇧ </a>

#### 配合 `Promise.all` 使用<a href="#catalogue"> ⇧ </a>

```js
import { promisify } from 'util';
const sleep = promisify(setTimeout);

async function f1() {
  await sleep(1000);
}

async function f2() {
  await sleep(2000);
}

async function f3() {
  await sleep(3000);
}

(async () => {
  console.time('sequential separate');
  await f1();
  await f2();
  await f3();
  console.timeEnd('sequential separate');
})();

(async () => {
  console.time('concurrent promise.all');
  await Promise.all([f1(), f2(), f3()]);
  console.timeEnd('concurrent promise.all');
})();

```

- Promise 是并发的，但如你一个一个地等待它们，会太费时间
- Promise.all() 可以节省很多时间

## 为何说 async 函数是语法糖

> async 函数的实现，其实就是将 Generator 函数和自动执行器，包装在一个函数里。

- 参考 非前端[阮一峰写的 《async 函数的含义和用法》](http://www.ruanyifeng.com/blog/2015/05/async.html) 一文
- 转码器 Babel 已经支持，转码后就能使用

## async 相较于 Promise 的优势

- 相较于 Promise，能更好地处理 then 链
- 中间值
- 调试

---

### 相较于 Promise，能更好地处理 then 链

> 假设有三个表示处理一系列连续步骤的函数 `async-stepFn.js`

```js
export const takeLongTime = (n, name, ...args) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(n + 200, name, ...args), n)
  })
}

export const step1 = (n, name, ...args) => {
  console.log(`${name} step1 with ${n}`)
  return takeLongTime(n, name, ...args)
}

export const step2 = (n, name, ...args) => {
  console.log(`${name} step2 with ${n}`)
  return takeLongTime(n, name, ...args)
}

export const step3 = (n, name, ...args) => {
  console.log(`${name} step3 with ${n}`)
  return takeLongTime(n, name, ...args)
}

```

> 现在用 Promise 方式来实现这三个步骤的处理 `async-vs-promise-step.js`

```js
// 运行 node async_await/async-vs-promise-step.js
import {step1, step2, step3} from './async-stepFn.js'

// Promise
const doItPromise = (name = 'doItPromise') => {
  console.time(name)
  const time1 = 300
  step1(time1, name)
    .then(time2 => step2(time2, name))
    .then(time3 => step3(time3, name))
    .then(result => {
      console.log(`${name} result is ${result}`)
    })
    .finally(() => {
      console.timeEnd(name)
    })
}

doItPromise()

```

> 用 async/await 来实现

```js
// 运行 node async_await/async-vs-promise-step.js
import {step1, step2, step3} from './async-stepFn.js'

// async Function
const doItAsync = async (name = 'doItAsync') => {
  console.time(name)
  const time1 = 300
  const time2 = await step1(time1, name)
  const time3 = await step2(time2, name)
  const result = await step3(time3, name)
  console.log(`${name} result is ${result}`)
  console.timeEnd(name)
}

doItAsync()

```

- 结果和之前的 Promise 实现是一样的
- 但代码更清晰，和同步代码一样

---

### 中间值

> 仍然是三个步骤，但每一个步骤都需要之前所有步骤的结果
>
> Promise的实现看着很晕，传递参数太过麻烦

```js
// 运行 node async_await/step-median.js
import {step1, step2, step3} from './async-stepFn.js'

// Promise
const doItPromise = (name = 'doItPromise') => {
  console.time(name)
  const time1 = 300
  // 每一个步骤都需要之前每个步骤的结果
  step1(time1, name)
    .then(time2 => {
      return step2(time2, name)
        // median // then 返回的中间值
        .then(time3 => [time1, time2, time3])
    })
    // median 中间值 times
    .then(times => {
      const [time1, time2, time3] = times
      return step3(time3, name)
        // median // then 返回的中间值
        .then(result => [time1, time2, time3, result])
    })
    .then(resultList => {
      const [, , , result] = resultList
      console.log(`${name} result is ${result}`)
    })
    .finally(() => {
      console.timeEnd(name)
    })
}

doItPromise()

```

> 用 async/await 来写：

```js
// 运行 node async_await/step-median.js
import {step1, step2, step3} from './async-stepFn.js'

// async
const doItAsync = async (name = 'doItAsync') => {
  console.time(name);
  const time1 = 300;
  const time2 = await step1(time1, name);
  const time3 = await step2(time2, name, time1);
  const result = await step3(time3, name, time2, time1);
  console.log(`${name} result is ${result}`);
  console.timeEnd(name)
}

doItAsync();

```

---

### 更易调试

> 较 Promise 更易于调试

- 因为没有代码块，所以不能在一个**返回的箭头函数**中**设置断点**
- 如果在一个 .then 代码块中使用调试器的步进(step-over)功能，***调试器并不会进入后续的 .then 代码块***
- 因为调试器**只能跟踪同步代码**的每一步

```js
const makeRequest = () => {
  return callOnePromise()
    .then(() => callOnePromise())
    // step-over 将跳过以下的 .then()
    .then(() => callOnePromise())
    .then(() => callOnePromise())
}
```

> 使用 async/await，就不必再使用箭头函数

- **可以对 await 语句执行步进操作**，就好像他们都是普通的同步语句一样

```js
const makeRequest = async () => {
  await callOnePromise()
  await callOnePromise()
  await callOnePromise()
}
```

> JavaScript的异步编写方式，从 **回调函数** 到 **Promise**、**Generator** 再到 **Async/Await**。表面上只是写法的变化，但本质上则是语言层的一次次抽象。让我们可以用更简单的方式实现同样的功能，而不需要去考虑代码是如何执行的

### 无法替代 Promise 的场景

> 前端进行并发请求，都请求完执行操作A; 否则执行操作B。

- 这种情况就是用的 Promise.all()
- Async/Await　对　Generator是取代关系，但不能完全取代 Promise
- 处理并发请求（只是处理并发请求，而不是并发）的时候，可采用 axios.all()，拿到的最终结果还是个Promise
- 然后再去业务层处理A，在这时与 Promise.all() 的效果相同
- 用 await/async 是串行，用 Promise.all() 是处理并发

```js
const serial =  async () => {
  const promiseA = promiseFnA()
  const promiseB = promiseFnB()

  try {
    // do something on valueA and valueB
    const valueA = await promiseA
    const valueB = await promiseB
  } catch (error) {
    throw error
  }
}

```

> 串行/并发

```js
// 运行 node async_await/async-serial-concurrent.js
const delay = (ms) => {
  return new Promise(resolve => { return setTimeout(resolve, ms)})
};

// 串行 async serial
;(async () => {
  const p1 = delay(2000)
  const p2 = delay(2000)
  console.time('delay_serial')
  await p1
  await p2
  console.timeEnd('delay_serial')
})();

// 并发 Promise.all
;(async () => {
  const p1 = delay(2000)
  const p2 = delay(2000)
  console.time('delay_concurrent')
  await Promise.all([p1, p2])
  console.timeEnd('delay_concurrent')
})();

// 显然两段代码的都 delay: 2000 ms

```

- 当调用 `promise = delay(2000)` 的时候，已发起 delay 的异步处理 setTimeout
- 此时 promise 的状态是 pending
- await 需要等 promise 状态变成 resolved(rejected则抛出异常)，才会继续后面的操作,可以理解为阻塞
- 如果是后一次的 delay 调用是等待前一次 resolve 才发起的，那么两次 delay 表现出来是串行的
- 在 await 之前就已经调用了两次 delay，所以表现出来的就是并发
- 就像调用 Promise.all，要求传入的参数是promise对象数组
- 调用 `Promise.all([delay(2000), delay(2000)])`
- 其实相当于分两步走：
  - `const p1 = delay(2000) // 已经发起异步处理`
  - `const p2 = delay(2000) // 已经发起异步处理`
  - `Promise.all([p1, p2]);`
- step2 其实在传给 Promise.all 之前，异步处理已经都发起了
- 所以并发并不是 Promise.all 处理的
- Promise.all 只是做了类似如下操作：

```js
async all(promiseList) {
  const result = [];
  for(const promise of promiseList) {
    result.push(await promise);
  }
  return result;
}
```

---

> 示例

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
  - 则 @aw 直接放在 Event Queue 中，等待执行即可
- 如果 await 后面实例状态是失败的话
  - 则 @aw 在 Web API 中永远不会进入到 Event Queue 中，因为永远不会执行
- 如果暂时还不知道是成功还是失败，则 @aw 先放置在 Web API 中
  - 等到知道实例状态是成功后，再挪至到 Event Queue 中等待执行

---

## 参考文章

- [JavaScript, Promise creation and Promise chains](https://learn.coderslang.com/0029-javascript-promise-chains/)
- [使用 Promise MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
- [Promise MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [现代 JavaScript 教程 / JavaScript 编程语言 / Promise，async/await / 简介：回调](https://zh.javascript.info/callbacks)
- [现代 JavaScript 教程 / JavaScript 编程语言 / Promise，async/await / Promise](https://zh.javascript.info/promise-basics)
- [现代 JavaScript 教程 / JavaScript 编程语言 / Promise，async/await / Promise 链](https://zh.javascript.info/promise-chaining)
- [现代 JavaScript 教程 / JavaScript 编程语言 / Promise，async/await / 使用 promise 进行错误处理](https://zh.javascript.info/promise-error-handling)
- [现代 JavaScript 教程 / JavaScript 编程语言 / Promise，async/await / Promise API](https://zh.javascript.info/promise-api)
- [现代 JavaScript 教程 / JavaScript 编程语言 / Promise，async/await / Promisification](https://zh.javascript.info/promisify)
- [现代 JavaScript 教程 / JavaScript 编程语言 / Promise，async/await / 微任务（Microtask）](https://zh.javascript.info/microtask-queue)
- [现代 JavaScript 教程 / JavaScript 编程语言 / Promise，async/await / Async/await](https://zh.javascript.info/async-await)
- [现代 JavaScript 教程 / JavaScript 编程语言 / Generator，高级 iteration / 异步迭代和 generator](https://zh.javascript.info/async-await)
- [Wangdoc 异步操作概述](https://wangdoc.com/javascript/async/general.html)
- [阮一峰 ES6 Promise 对象](https://es6.ruanyifeng.com/#docs/promise)
- [axios 中文文档](http://www.axios-js.com/zh-cn/docs/)
- [axios/axios](https://github.com/axios/axios)
- https://axios-http.com/
- [Promise源码](https://github.com/then/promise/blob/master/src/core.js)
- [PromiseA+规范](https://promisesaplus.com/)
- [ecma262: Promise Abstract Operations](https://tc39.es/ecma262/#sec-promise-abstract-operations)

## 相关文章

- [JS异步编程模型与Promise初探](http://note.youdao.com/noteshare?id=7b5ebe053ac7a1d270784f635c7b5141&sub=088D07070F0B401E916EB1247A54D15B)
- [使用 Promise 时的5个常见错误](https://juejin.cn/post/7034661345148534815?utm_source=gold_browser_extension)
- [axios, ajax和fetch的比较](http://www.axios-js.com/zh-cn/blogs/)
- [如何中断Promise？](https://juejin.cn/post/6847902216028848141)
- [Promise深度解析10个常用模块](https://juejin.cn/post/6999804617320038408)
- [前端 Promise 常见的应用场景](https://juejin.cn/post/6844904131702833159)
- [async/await 之于 Promise，正如 do 之于 monad（译文）](https://juejin.cn/post/6844903842723659790)

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
