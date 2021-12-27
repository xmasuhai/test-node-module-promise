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
> 使用关键字 async 来修饰 function 或者箭头函数`async() => {}`
>
> 在函数内部使用 await 来表示 **等待异部操作的结果**，用变量来接收

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
- 不再需要使用 `.then()` 的方法拿到异步结果
- `async/await` 可以使异步代码在形式上更接近于同步代码

```js
;(async function testAsync() {
          const p3 = Promise.resolve(3)

          p3
                  .then(data => {
                    console.log("p3data", data)
                  })

          // 第一种 await 后面是个Promise对象
          const data1 = await p3
          console.log("data1", data1)

          // 第二种 await 后面是个普通的值
          const data2 = await 4  // await Promise.resolve(4) // 自动封装成 promise 对象
          console.log("data2", data2)

          // 第三种 await 后面是个函数
          const data3 = await test1()
          console.log("data3", data3);
        }
)()

;(async () => {
  const a = await (() => {console.log('hi')} )
  console.log(typeof a) // function
  console.log('a', a) // () => {console.log('hi')}
})();
```

> 参考

- [Promise？async？await](https://juejin.cn/post/6981317692275818527)


### `async/await`注意事项<a href="#catalogue"> ⇧ </a>

> async 函数的 **返回值也是一个 Promise 实例**

- 使用 `async` 声明一个 **异步函数**，并总是 **返回一个 promise 对象**，其他值将自动被包装在一个 resolved 的 promise 中
  - 因此可以直接 return 变量或值，无需手动显式地调用 `Promise.resolve()` 进行转换
  - 使用 return 关键字返回了值，就会被 `Promise.resolve()`包装成一个 promise 对象
    - 如果不显式地 return 一个值，默认返回 `Promise.resolve(undefined)`
    - 被 `Promise.resolve(undefined)`包装后得到 一个`fulfilled`状态的 `Promise {<fulfilled>: undefined}` 实例对象
- 调用 `.then()` 可以得到返回值

```js
async function f() {
  return 1;
}

f().then(alert); // 1

// 也可以显式地返回一个 promise，结果是一样的
async function f() {
  return Promise.resolve(1);
}

f().then(alert); // 1
```

- async 确保了函数返回一个 promise，也会将非 promise 的值包装进 Promise 里去

```js
async function foo() {
  console.log(1)
  return 3
}

// 返回的promise调用 then 方法
foo().then(console.log)

;(async () => {
  const a = await foo()
  console.log(a)
})();
```

---

> `await`

- `async`总是与 `await` 一起使用
  - 并且 `await` **只能在 async 修饰的异步函数体内** 使用
  - 不能在 **顶级作用域**  中，如`<script>`标签或模块（*P.S. 新特性：从 V8 引擎 8.9+ 版本开始，顶层 await 可以在 模块 中工作）中使用
    - 因为顶级作用域不是一个 `async` 方法

```js
;(async () => {
  // 只在 async 函数内工作
  const value = await (Promise.resolve(1));
  console.log(value)
  return value
})();
```

- 关键字 `await` 让 JavaScript 引擎等待直到 promise 完成（settle）并返回结果

```js
async function f() {
  const promise = new Promise((resolve/*, reject*/) => {
    setTimeout(() => resolve("done!"), 1000)
  });
  const result = await promise; // 等待，直到 promise resolve (*)
  alert(result); // "done!"
  return result // 相当于 // return Promise.resolve(result)
}

f();
// 这个函数在执行的时候，“暂停”在了 (*) 那一行
// 并在 promise settle 时，拿到 result 作为结果继续往下执行
// 所以上面这段代码在一秒后显示 “done!”
f().then(res => {console.log(res)}) // done!
```

> `async` 函数执行的过程

- 未遇到 `await` 的代码同步执行
- 一旦遇到 `await` 就会先在内部 **得到 pending(进行中) 状态的 Promise 实例**
- 将第一个 `await` 表达式，看做一个微任务，推送到微任务队列，等待调用
- 第一个`await` 表达式后的所有语句统一看做这个 **微任务中的(宏/微/同步)任务（嵌套）**
- 并且暂停执行 `await` 表达式后的所有语句
- 等到主线程中同步任务执行完毕，开始抓取微任务队列的任务执行
- 当执行到此 `await` 表达式时
  - 如果 `await` 表达式后是同步代码，则紧跟 `await` 表达式一起执行
  - 如果 `await` 表达式后是异步代码，再将 `await` 表达式之后的异步代码，按照微/宏任务，分别推送到微/宏任务队列，等待依次调用
- `await` 是个运算符，用于组成表达式，它会 **阻塞** 后面的代码，即暂停执行 `await` 表达式后的所有语句

> `async` 函数执行的结果

- 如果 `await` 调用异步函数后，等到的是 `Promise` 对象
  - 则 **得到其 resolve 值**
  - 否则，会将非`Promise` 对象得值进行 `Promise.resolve()` 包装
- 执行 `async` 函数，返回的都是一个 `Promise` 对象
  - 该 `Promise` 对象 最终 `resolve` 的值就是在函数中 `return` 的内容
- `async` 语句 **全部执行完毕** 且 **无错误** 的情况下
  - 则返回的 Promise 实例会变为已成功
  - 否则会变为已失败

> `async` 函数其他注意点

- `async` 内部不用写 `.then` 及其回调函数
  - 这会减少代码行数，也避免了代码书写形式上的嵌套，但运行机制上还是嵌套
- 所有异步调用，可以写在 **同一个代码块** 中，无需定义多余的中间变量
  - 比如 `.then()`链式调用中的`resolve`和`reject`
- 一个 `await` 就是一层嵌套，嵌套包裹 `await` 表达式后面的代码，一层嵌套就是 一整个微任务，代码形式上是 **同步**
  - 相似的，一个 `.then()` 就是一层回调嵌套，就是 一整个微任务，只不过代码形式上是 **链式调用**
- `async/await`使 ***异步代码，在形式上，等同于同步代码***
  - 好比将套娃展开陈列，而回调函数则是层层嵌套
- 在 `async` 方法中，**首个 await 之前** 的代码会 **同步执行**
- 首个 `await` 之后的代码包括表达式内的JS代码，会 **异步执行**
- `async/await` 是建立在 `Promises`上的，不能被使用在普通回调函数以及节点回调

```js
async function foo() {
  console.log(2)
  console.log(await Promise.resolve('8-1'))
  console.log(await Promise.resolve('8-2'))
  console.log(9)
}

async function bar() {
  console.log(4)
  console.log(await '6-1')
  console.log(await '6-2')
  console.log(7)
}

console.log(1)
foo()
console.log(3)
bar()
console.log(5)

/*
console.log(1) // sync code 
console.log(2) // sync
// add to microtask queue
// [{console.log(await Promise.resolve('8-1)')...}]
console.log(3) // sync
console.log(4) // sync
// add to microtask queue
// [{console.log(await Promise.resolve('8-1'))...}, {console.log(await '6-1')...}]
console.log(5) // sync code all over
// grab one microtask from microtask queue
console.log('8-1') // invoke microtask {console.log(await Promise.resolve(8-1))...}
// add to microtask queue
// microtask queue [{console.log(await 6-1)...}, {console.log(await Promise.resolve(8-2))...}]
// grab one microtask from microtask queue
console.log('6-1') // invoke microtask {console.log(await Promise.resolve(6-1))...}
// add to microtask queue
// microtask queue [{console.log(await Promise.resolve(8-2))...}, {console.log(await 6-2)...}]
// grab one microtask from microtask queue
console.log('8-2') // invoke microtask {console.log(await Promise.resolve(8-2)), console.log(9)}
console.log(9)
// microtask queue [{console.log(await 6-2)...}]
// grab one microtask from microtask queue
console.log('6-2') // invoke microtask {console.log(await 6-2), console.log(7)}
console.log(7)
*/
```

- await 实际上会暂停函数的执行，直到 promise 状态变为 settled
- 然后以 promise 的结果继续执行
- 这个行为不会耗费任何 CPU 资源，因为 JavaScript 引擎可以同时处理其他任务：执行其他脚本，处理事件等
- 相比于 promise.then，它只是获取 promise 的结果的一个更优雅的语法，同时也更易于读写

> 以读取文件为例：

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
- 没有前后依赖那不如用 promise 了

> 假设有一个 getJSONData 方法，返回一个 promise 对象
>
> 该 promise对象 会被 resolve 为一个 JSON 对象
>
> 调用该方法，输出得到的 JSON 对象，最后返回"done"。

```js
// 使用promise的实现方式
const makeRequestByPromise = () =>
  getJSONData()
    .then(data => {
      console.log(data)
      return "done"
    })

makeRequestByPromise()

// 使用async/await
const makeRequestByAsync = async () => {
  const data = await getJSON() // 直到 getJSON() 返回的 promise resolve 后 才得到值
  console.log(data)
  return "done"
}

makeRequestByAsync()

// this will not work in top level
await makeRequestByPromise()
    
// this will work
makeRequestByPromise()
  .then((result) => {
  // do something
  })
```

- 不需要为 .then 编写一个匿名函数来处理返回结果 `(resolve) => {}`

---

### async/await 错误处理

```js
const makeRequest = () => {
  try {
    getJSON()
      .then(result => {
        // this parse may fail
        const data = JSON.parse(result) // try/catch 不能捕获 成功回调resolve中 JSON.parse 抛出的异常
        console.log(data)
      })
      /* uncomment this block to handle asynchronous errors */
      /*
      .catch((err) => {
        console.log(err)
      })
      */
  } catch (err) {
    console.log(err) // try/catch 不能捕获 JSON.parse 抛出的异常
  }
}
```

- try/catch 不能捕获 **成功回调resolve** 中 JSON.parse 抛出的异常

> 改用 async/await

```js
const makeRequest = async () => {
  try {
    // this parse may fail
    const data = JSON.parse(await getJSON())
    console.log(data)
  } catch (err) {
    console.log(err)
  }
}
```

- 此处catch代码块可以捕获JSON.parse抛出的异常

### 在条件分支中进一步解套 Promise

```js
const makeRequest = () => { // 第一层
  return getJSON() // 请求数据
    .then(data => { // 第二层
      // 根据返回数据中的某些内容 进一步判断
      if (data.needsAnotherRequest) { // 第三层
        return makeAnotherRequest(data)
          .then(moreData => { // 第四层
            console.log(moreData)
            return moreData
          })
      } else {
        console.log(data)
        return data
      }
    })
}
```

- 请求数据，然后根据返回数据中的某些内容决定
  - 是直接返回这些数据
  - 还是继续请求更多数据

> 使用 async/await 改写

```js
const makeRequest = async () => {
  const data = await getJSON() // 请求数据
  if (data.needsAnotherRequest) {
    const moreData = await makeAnotherRequest(data); // 进一步请求数据
    console.log(moreData)
    return moreData
  } else {
    console.log(data)
    return data
  }
}

```

### promise 结果逐层依赖，省略中间值

> 请求 promise1，使用它的返回值请求 promise2，最后使用这两个 promise 的值请求 promise3

```js
const makeRequest = () => {
  return promise1()
    .then(value1 => {
      // do something
      return promise2(value1)
        .then(value2 => {
          // do something          
          return promise3(value1, value2)
        })
    })
}
```

> 如果 promise3 没有用到 value1，则可以把这几个 promise 改成嵌套的模式
>
> 也可以把 value1 和 value2 封装在一个 Promsie.all 调用中以避免深层次的嵌套

```js
const makeRequest = () => {
  return promise1()
    .then(value1 => {
      // do something
      return Promise.all([value1, promise2(value1)])
    })
    .then(([value1, value2]) => {
      // do something          
      return promise3(value1, value2)
    })
}
```

- 这种方式为了保证可读性而牺牲了语义
- 除了避免嵌套的 promise，没有其它理由要把 value1 和 value2 放到一个数组里

> async

```js
const makeRequest = async () => {
  const value1 = await promise1()
  const value2 = await promise2(value1)
  return promise3(value1, value2)
}
```

### 判断执行顺序

> 第一题

```js
function waitHandle() {
  console.log(3)
}

async function asyncFn() {
    console.log(1)
    await waitHandle()
    console.log(2)
}

asyncFn()
// 1 3 2

// 转换为 Promise.then() 等效的执行顺序
function asyncPfn(){
    console.log(1)
    return new Promise((res) => {
        waitHandle() // console.log(3)
    })
    .then((res) => {
        // await 执行完毕后才会执行后面的操作
        console.log(2)
    })
}

```

> 第二题

```js
//不加async await
 function foo () {
   Promise.resolve()
     .then(resolve => {
      console.log("1");
  });
  console.log(3);
}
foo();
// 3  1

//加了async await
async function foo2 () {
  await Promise.resolve()
    .then(resolve => {
    console.log("1");
  });
  console.log(3);
}
foo2();
// 1 3

```

---

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

> Promise

- ECMAScript 6 新增的引用类型 Promise
- 可以通过 new 操作符来实例化
- 创建新期约时需要传入执行器（executor）函数作为参数
- 三个状态，分别是pending（执行中）、success（成功）、rejected（失败）
- 无论 `resolve()` 和 `reject()` 中的哪个被先调用，状态转换都不可撤销
  - 后调用的方法继续修改状态会静默失败
- 为避免期约卡在待定状态，可以添加一个定时退出功能
  - 比如，可以通过 setTimeout 设置一个 10000 秒钟后无论如何都会拒绝期约的回调
  - `const p = new Promise((resolve, reject) => { /*...*/ setTimeout(reject, 10000);}`
  - 10 秒后调用 reject() // 执行函数的逻辑

---

### 相较于 Promise，能更好地处理 then 链

> 假设有三个表示处理一系列连续步骤的函数 `stepFn.js`

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

> 现在用 Promise 方式来实现这三个步骤的处理 `step.js`

```js
// 运行 node async_await/step.js
import {step1, step2, step3} from './stepFn.js'

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
// 运行 node async_await/step.js
import {step1, step2, step3} from './stepFn.js'

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
import {step1, step2, step3} from './stepFn.js'

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
import {step1, step2, step3} from './stepFn.js'

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

---

## 无法替代 Promise 的场景

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
// 运行 node async_await/serialConcurrent.js
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

## async/await 的错误使用

```js
;(async () => {
  const pizzaData = await getPizzaData(); // async call
  const drinkData = await getDrinkData(); // async call
  const chosenPizza = choosePizza(); // sync call
  const chosenDrink = chooseDrink(); // sync call
  await addPizzaToCart(chosenPizza); // async call
  await addDrinkToCart(chosenDrink); // async call
  orderItems(); // async call
})();

```

> 几个错误点

- `pizzaData` 与 `drinkData` 之间没有依赖
  - 顺序的 await 会最多让执行时间增加一倍的 `getPizzaData` 函数时间
  - 因为 getPizzaData 与 getDrinkData 应该并行执行
- 正确的做法应该是先同时执行函数，再 await 返回值，这样可以并行执行异步函数

```js
;(async () => {
  const pizzaPromise = selectPizza(); // sync call
  const drinkPromise = selectDrink(); // sync call
  await pizzaPromise; // async call
  await drinkPromise; // async call
  orderItems(); // async call
})();

```

- 使用 Promise.all 并行处理

```js
;(async () => {
  Promise.all([
    selectPizza(),
    selectDrink()
  ])
          .then(orderItems); // async call
})();
```

- async/await 虽然层级形式上一致了，但逻辑上还是嵌套关系，转换还是隐式的
- async/await 只能实现一部分回调函数支持的功能，也就是仅能方便应对 **层层嵌套** 的场景

```js
// 比如两对回调
a(() => {
  b();
});

c(() => {
  d();
});

// 性能低效的执行方式
await a();
await b();
await c();
await d();

// 翻译成回调
a(() => {
  b(() => {
    c(() => {
      d();
    });
  });
});
```

- 原始代码中，函数 c 可以与 a 同时执行
- async/await 语法在 b 执行完后，再执行 c
- async/await 性能地狱

> 完全脱离无关依赖

```js
// 隔离成两个函数
(async () => {
  await a();
  b();
})();

(async () => {
  await c();
  d();
})();

// 或者利用 Promise.all
async function ab() {
  await a();
  b();
}

async function cd() {
  await c();
  d();
}

Promise.all([ab(), cd()]);
```

- 大部分场景代码是非常复杂的，同步与 await 混杂在一起
- 不用一昧追求 async/await 语法，在必要情况下适当使用回调，是可以增加代码可读性的

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
- [理解 JavaScript 的 async/await](https://segmentfault.com/a/1190000007535316)
- [精读《async/await 是把双刃剑》](https://juejin.cn/post/6844903602645909518)

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
