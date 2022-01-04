# 异步非全解 期约Promise

- [代码仓库 test-node-module-promise](https://github.com/xmasuhai/test-node-module-promise)

---

> 大纲链接<a id="catalogue" href="#catalogue" > § </a>

[toc]

---

## 回调地狱 <a href="#catalogue"> ⇧ </a>

### 避免回调地狱的原因 <a href="#catalogue"> ⇧ </a>

- 多层回调函数的相互嵌套，就形成回调地狱
- 例如嵌套网络请求，第一次网络请求成功后回调函数再次发送网络请求

```js
getCityFromIp(ip, (city) => {
    getWeatherFromCity(city, (weather) => {
        getSuggestionFromWeather(weather, suggestion => {
            ...
        })
    })
})

setTimeout(() => {
  console.log('延时1秒后输出')
    setTimeout(() => {
      console.log('延时2秒后输出')
      setTimeout(() => {
        console.log('延时3秒后输出')
    }, 3000)
  }, 2000)
}, 1000)
```

- 层层嵌套，难以维护
- 冗余代码嵌套层级过深，可读性差
- 错误处理更复杂

---

> 为了代码更加具有 **可读性** 和 **可维护性** ，需要将 **数据请求** 与 **数据处理** 明确的区分开来，ES6中使用 Promise 解决回调地狱

- 分离 **数据请求** 操作与 **数据处理** 操作
- 将层层嵌套变为`.then()`链式调用，减少缩进
- 使用写同步的方式写异步
- 易于错误处理

```js
f1(a)
  .then(b => f2(b), onerror1)
  .then(c => f3(c), onerror2)
  .catch(err => {})
```

### 如何确保代码执行顺序

- 可以利用函数调用栈，将想要执行的代码放入 **回调函数** 中

```js
// 一个简单的封装
function wantFn() {
    console.log('执行要最后执行的代码');
}

function fn(wantFn) {
    console.log('这里执行了一大堆各种代码');

    // 其他代码执行完毕，最后执行 回调函数
    wantFn && wantFn();
}

fn(wantFn);

```

> 除了利用函数调用栈的执行顺序之外，还可以利用 **队列机制**

```js
function want() {
    console.log('要执行的代码');
}

function fn(want) {
    // 将想要执行的代码放入队列中
    // 根据事件循环的机制，不用非得将它放到最后面了，自由选择
    want && setTimeout(want, 0);
    
    console.log('这里表示执行了一大堆各种代码');
}

fn(want);
```

> 利用 Promise 将任务放在任务队列中

```js
function wantFn() {
  console.log('要执行的代码');
}

function fn(wantFn) {
  console.log('这里表示执行了一大堆各种代码');

  // 返回Promise对象
  return new Promise(function(resolve, reject) {
    typeof wantFn === 'function'
      ? resolve(wantFn)
      : reject('TypeError: '+ wantFn +'不是一个函数')
  })
}

fn(wantFn)
  .then((resFn) => {
    resFn(); // wantFn()
  })

fn('1234')
  .catch(function(err) {
    console.log(err);
  })

```

---

## `Promise`的基本概念<a href="#catalogue"> ⇧ </a>

- `Promise` 是一个特殊的 **对象类型**，用来 **处理异步操作**
- 确切地说是 ***封装一个异步操作并获取结果***
- `Promise` 是一个构造函数
  - `new Promise()`先返回一个 pending 状态的 **promise 实例对象**
- 创建`Promise`实例：`const promise = new Promise(executor);`
  - 这个执行函数`executor`代表 **异步操作**
  - 参数`executor`的类型为函数
  - 还需向 `executor` 提供两个类型为函数的参数 `(resolve, reject) =>  { /*一般写异步函数*/}`
    - `resolve(result)` 成功时的回调
      - 把返回的该Promise对象的状态从变 pending 为`fulfilled`
      - 并在该Promise对象中传递（包裹）成功的结果 `result`
    - `reject(reason)` 失败时的回调
      - 把返回的该Promise对象的状态从变 pending 为`rejected`
      - 并在该Promise对象中传递（包裹）失败的信息 `reason`
  - 参数`executor`函数是自动执行
    - 但必须在函数内部手动调用 `resolve(result)` / `reject(reason)`，才会改变返回的 Promise 对象的结果
    - 否则 返回的 Promise 对象一直处于 pending 状态

```js
// executor为一个普通函数 方便在面试题中记录命名 一般用箭头函数
new Promise(function fn() {}) // Promise {<pending>}
// executor为一个匿名的箭头函数
new Promise(() => {}) // Promise {<pending>}
// 提供两个类型为函数的参数，命名任意，但约定俗成为 resolve 和 reject
new Promise((resolve, reject) => {}) // Promise {<pending>}
// 在executor中调用 resolve()
new Promise((resolve, reject) => {resolve()}) // Promise {<fulfilled>: undefined}
// 在executor中调用 reject()
new Promise((resolve, reject) => {reject()}) // Promise {<rejected>: undefined}
// resolve 一般必须写出 reject可省略 调用reject必须先写出resolve
new Promise((resolve/*, reject*/) => {resolve()}) // Promise {<fulfilled>: undefined}
// 传值 通过返回一个新的包含值的Promise对象来传值
new Promise((resolve) => {resolve(1)}) // Promise {<fulfilled>: 1}
// 传失败的信息 通过返回一个新的包含失败信息的Promise对象来传失败的信息
new Promise((resolve, reject) => {reject(1)}) // Promise {<rejected>: 1}
// 以上都是同步执行
// 以下异步处理
new Promise((resolve, reject) => {
  // 定时器 API
  setTimeout(() => {
    resolve()
  }, 0)
}) /* 一开始同步执行 返回一个 pending 状态的Promise对象；
 异步代码执行，将该Promise对象的状态变为 fulfilled */
new Promise((resolve, reject) => {
  // 定时器 API
  setTimeout(() => {
    reject()
  }, 0)
}) /* 一开始同步执行 返回一个 pending 状态的Promise对象；
 异步代码执行，将该Promise对象的状态变为 rejected */
```

> promise 实例对象创建与使用过程

- `new Promise((resolveCb, rejectCb) => {/*一般写异步函数*/})`，预先声明的形参`resolveCb`、`rejectCb`
  - 先返回一个`pending`状态的 promise 实例对象
    - 如果走成功的逻辑，调用`resolveCb(传值)`
      - 立即把该Promise对象的状态变为`fulfilled`
    - 如果走失败的逻辑，调用`rejectCb(传失败原因)`
      - 立即把该Promise对象的状态变为`rejected`
  - 该 promise 实例对象

```js
// 1. 新建一个 promise对象
// 2. new 一个构造函数 Promise，接收一个回调函数，这个函数被称为 执行器函数，里面一般执行异步任务
// 3. 执行器函数接收两个参数 resolved和rejected 两个参数都为函数类型
// 4. 异步操作根据逻辑条件判断，成功 执行resolved(result)；失败 执行rejected(reason)
const p = new Promise((resolved, rejected) => {
  setTimeout(() => {
    // 模拟异步任务 如果当前时间为偶数就成功 否则就失败
    const time = Date.now()
    time % 2 === 0
      ? resolved(`执行成功 ${time}`)
      : rejected(`执行失败 ${time}`)
  }, 1000)
})

p.then(
  // 接收成功的value数据 onResoled
  value => {
    console.log(`onResoled ${value}`)
  },
  // 接收失败的reason数据 onRejected
  reason => {
    console.log(`onRejected ${reason}`)
  }
)

```

> promise 实例对象内部运行变化

- 当`new Promise()`被实例化后，即表示 Promise 进入 pending 初始化状态，准备就绪，等待后续调用方法
- 一旦 promise 实例运行成功或者失败之后，实例状态就会变为 fulfilled 或者 rejected
  - 此时状态就无法变更
- 内部主要就是状态的变化
  - 在状态为 pending 时，会等待，不将回调放入相应的队列（宏/微）中
  - 一旦对象状态改变成非 pending 态，就会将回调放入相应的队列中

> 处理非异步情况：

```js
const p = new Promise(function (resolve, reject) {
    // 同步
    resolve('Promise');
})
p.then((result) => {
    console.log(1)
})
p.then((result) => {
    console.log(2)
});

```

- 先实例化 Promise，同时执行完执行器函数（同步），状态由 pending 变为 fulfilled，Promise 实例回调函数执行完成
- 此时并不会将 then 回调函数保存，函数顺序执行
- 继续执行，保存 then 回调，发现 Promise 状态已经变为 fulfilled，then 的成功回调直接运行
- 以上代码的两个then回调都是这样

> 处理异步情况：

```js
const p = new Promise(function (resolve, reject) {
    // 异步函数
    setTimeout(()=> {
        console.log('setTimeout');
        resolve('Promise')
    }, 1000)
})

p.then((result) => {
    console.log(1)
})
p.then((result) => {
    console.log(2)
});

```

- 先实例化 Promise，同时执行完执行器函数（同步）
- 由于是执行 setTimeout 函数，定时器开始计时，状态依然还是 pending
- Promise 实例的执行器函数执行完成，继续执行其他同步代码
- 执行第一个`p.then`
  - Promise 状态还是 pending，并不会将 then 回调函数保存到任务队列中
- 执行第二个`p.then`
  - Promise 状态还是 pending，并不会将 then 回调函数保存到任务队列中
- 执行栈代码清空，同步代码执行完毕
- 定时器到时，回调函数进入任务队列，状态依然还是 pending
- 开始抓取任务队列中的回调函数到执行栈中执行
  - `console.log('setTimeout')` **打印setTimeout**
  - `resolve('Promise')` 立即将 状态变为 `fulfilled`
  - 触发第一个`p.then` 将回调函数放到任务队列中
  - 紧接着触发第二个`p.then` 将回调函数放到任务队列中
  - 执行栈代码清空，开始抓取任务队列中的回调函数到执行栈中执行
- 执行被保存在任务队列中的 then 回调
  - `console.log(1)` **打印1**
  - `console.log(2)` **打印2**
- 执行栈代码清空，所有代码执行完毕

> 提示：`then/catch ` 都是一个 Promise

### 使用 Promise 的一般写法<a href="#catalogue"> ⇧ </a>

```js
function fn(arg) {
  return new Promise(function (resolve, reject) {
    if (成功的条件) {
      resolve(data)
    } else {
      reject(reason)
    }
  })
}

fn(arg)
  .then(function (data) {
    console.log(data)
  })
  .catch(function (reason) {
    console.log(reason)
  })
```

---

> 使用 Promise 前：

```js
const getWeather = (city, onOk, onFail) => {
  const xhr = new XMLHttpRequest()
  let url = `http://rap2api.taobao.org/app/mock/244238/weather?city=${city}`
  xhr.open('GET', url, true)

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status >= 200) {
      onOk(JSON.parse(xhr.responseText))
    } else {
      onFail()
    }
  }

  /*
  // 过时
  xhr.onload = () => onOk(JSON.parse(xhr.responseText))
  xhr.onerror = () => onFail
  */

  xhr.send()
}

getWeather('北京',
  weather => { // onOk
    console.log(weather)
    // ...
  },
  () => { // onFail
    console.log('error')
  }
)
```

> 使用 Promise 后：

```js
const getWeather = city => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    // let url = `http://rap2api.taobao.org/app/mock/244238/weather?city=${city}`
    let url = `http://rap2.taobao.org:38080/app/mock/245421/getWeather?city=${city}`
    xhr.open('GET', url, true)

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status >= 200) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject('接口异常')
      }
    }

    /*
        xhr.onload = () => resolve(JSON.parse(xhr.responseText))
        xhr.onerror = () => reject('接口异常')
    */

    xhr.send()
  })
}

getWeather('上海')
  .then(weather => {
    console.log('weather')
  })
  .catch(err => {
    console.log(err.message)
  })
```

> 复杂案例：

```js
/*
const getIp = () => {....}
const getCityFromIp = ip => {....}
const getWeatherFromCity = city => {....}

getIp()
  .then(ip => getCityFromIp(ip))
  .then(city => `中国 ${city}`)
  .then(city => getWeatherFromCity(city))
  .then(data => {console.log(data)})
  .catch(err => console.log(err))

*/
const getIp = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(
      'GET',
      'http://rap2.taobao.org:38080/app/mock/245421/getIp',
      true)

    xhr.onload = () => {
      xhr.status === 200
        ? resolve(JSON.parse(xhr.responseText).ip)
        : reject('接口数据异常')
    }
    xhr.onerror = () => reject('获取IP失败')
    xhr.send()
  })
}

const getCityFromIp = ip => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(
      'GET',
      `http://rap2.taobao.org:38080/app/mock/245421/getCity?ip=${ip}`,
      true)

    xhr.onload = () => {
      resolve(JSON.parse(xhr.responseText).city)
    }
    xhr.onerror = () => reject('获取city失败')
    xhr.send()
  })
}

const getWeatherFromCity = city => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(
      'GET',
      `http://rap2.taobao.org:38080/app/mock/245421/getWeather?city=${city}`,
      true)

    xhr.onload = () => {
      xhr.status === 200
        ? resolve(JSON.parse(xhr.responseText))
        : reject('天气接口异常')
    }
    xhr.onerror = () => reject('获取天气信息失败')
    xhr.send()

  })
}

getIp()
  .then(ip => getCityFromIp(ip))
  .then(city => `中国 ${city}`)
  .then(city => getWeatherFromCity(city))
  .then(data => {console.log(data)})
  .catch(err => console.log(err))

```

---

> 在以下例子中，假设`getUserCount` 是一个返回 `Promise` 的函数

```js
const userCount = getUserCount();
console.log(userCount); // Promise {<pending>}
```

- 如果尝试立即显示 `userCount` 变量的值，会得到的是 `Promise {<pending>}`
- 这是有可能发生的，因为还没有数据，需要等待它的返回值
- 在**不能立即获得返回值**的情况下，许多异步函数会返回一个 `Promise`

> 其他基础概念

### `Promise`的执行过程

1. 初始化 Promise 状态为（Pending）
2. 立即同步执行 Promise 中传入的 fn 函数，将 Promise 内部 `resolve`、`reject` 函数作为参数传给 fn，按事件机制执行机制或条件调用 `resolve(result: unknown)`、`reject(reason: unknown)`；
3. 执行器 fn 函数体中代码 如果没有执行`resolve()`或`reject()`，则状态一直为`pending`，后续的 `.then` 返回的 Promise 状态也为 pending，不会将回调放入任务队列
4. 如果同步执行了`resolve()`或`reject()` 则立即将状态变为相应的`fulfilled`或`rejected`
5. 如果异步异步执行`resolve()`或`reject()`，状态仍为`pending`，等待执行异步回调，将状态变为`fulfilled`或`rejected`
6. 状态一变化，就分别传递成功或失败的结果`resolve(result: unknown)`、`reject(reason: unknown)`给下一步
7. 执行 `.then()` 注册回调到微任务队列，分别接收上一步成功或失败的结果`resolve(result: unknown)`或`reject(reason: unknown)`
8. Promise 的关键是要保证 `.then()` 方法传入的参数 `onFulfilled` 和 `onRejected`，必须在 `.then()` 方法被调用的那一轮事件循环之后的新执行栈中执行

> 链式 Promise 是指在当前 promise 达到 `fulfilled`或`rejected` 状态后，即开始进行下一个 promise

### `Promise`的状态<a href="#catalogue"> ⇧ </a>

> 一个 Promise 可以有多种状态：

- 进行中（Pending） - 响应还没有就绪。请等待
  - 比如正在进行的网络请求还未响应，或者定时器还没有到时间
- 已完成（Fulfilled） - 响应已完成。成功。请获取数据
  - 当主动调用 resolve() 函数，就处于满足状态，并会回调 then()
- 已拒绝（Rejected） - 出现了一个错误。请处理它
  - 当主动调用 reject() 函数，就处于该状态，并且会回调 catch()

> 当在 **pending 进行中** 的状态时，不可以做任何事，仅仅是等待

- `new Promise((resolveCb, rejectCb) => {})`
  - 调用函数 `resolveCb()` Promise对象由 `pending` 状态变为 `fulfilled` 状态
  - 调用函数 `rejectCb()` Promise对象由 `pending` 状态变为 `rejected` 状态

> 只有变为非 pending 状态，才会执行 .then 中相应的回调

```js
//Question1
 new Promise(resolve => {
     console.log('promise')
     // 没有调用 resolve()，不执行任何后续 .then() 操作，一直处于 Pending 状态
   })
   .then(function() {
     console.log('promise1')
   })
   .then(function() {
     console.log('promise2')
   })

// promise
 
```

> 状态转换只有两种

- `pending -> resolved`
- `pending -> rejected`

> 不显示写明返回值，默认返回 undefined

```js
new Promise(resolve => {
    resolve(1)
  })
  .then(function(res) {
    console.log(res) // 接受 resolve(1) 传过来的 1
    // promise 对象的状态变为 Fulfilled
    // 不显示写明返回值，默认返回 undefined
  })
  .then(function(res) {
    console.log(res) // 上一步返回 undefined，以 undefined 作为res结果
    // 不显示写明返回值，默认返回 undefined
  })
// 1
// undefined

```

> 一个 promise 对象的状态只能改变一次状态

- 无法取消，无法回退
- 一般地，成功后结果数据为`value` 失败后结果为`reason`

```js
//Question3
new Promise((resolve, reject) => {
     resolve(1) // 状态成功，往下执行
     reject() // 状态已变化，忽略本行代码
   })
   .then(function(res) { // 接收上一次传来的结果 1
     console.log('promise1')
        return res // 将上一次传来的结果 1，隐式调用 Promise.resolve(1) 封装为Promise对象
   })
   .then(function(res) {
     console.log(res) // 接受上一步的返回值
   })
// promise1
// 1

new Promise((resolve, reject) => {
     reject(1) // 状态失败，往下执行
     resolve(1) // 状态已变化，忽略本行代码
   })
   .then(function(res) { // 忽略成功的回调
     console.log('promise1')
        return res
   }, function(reason) { // 走失败回调的逻辑
       console.log(reason) // 输出1
       return reason // 返回 Promise {<fulfilled>: 1}
   })
   .then(function(res) {
     console.log(res) // 输出1
   }) // 返回 Promise {<fulfilled>: undefined}
// 1
// 1
```

> `.then(1)` 传参不为函数时，直接忽略此步

```js
//Question4
new Promise(resolve => {
     resolve(1) // 成功，往下执行
   })
   .then(1) // .then(1) 被略过
   .then(function(res) {
     console.log(res) // 接收 resolve(1) 传过来的 1
   })
// 1

```

---


### `.then()`

> `.then()`为了后续处理成功/失败接收报错信息

- 根据 接收上一个Promise 对象实例中处理的 **状态为成功或失败**，分别调用 `resolve()`和`reject()`

```js
const userCount = getUserCount();
// 成功
const handleSuccess = (result) => {
console.log(`Promise was fulfilled. Result is ${result}`);
}
userCount.then(handleSuccess);
// 失败
const handleReject = (error) => {
  console.log(`Promise was rejected. The error is ${error}`);
}
userCount.catch(handleReject);
```

- getUserCount 函数返回一个 Promise，所以不能直接使用 userCount
- 为了有效处理返回的数据（data），需要增加 `.then` 和 `.catch` 的处理函数，以便成功或失败的时候可以被调用
- `.then` 会接收上一个任务的返回值，如果 `.then` 中的操作没有意义会被忽略

> then 和 catch 函数可以被连续的调用

- 在这个例子中，同时关注成功（success）和失败（failure）

```js
const userCount = getUserCount();

const handleSuccess = (result) => {
  console.log(`Promise was fulfilled. Result is ${result}`);
}

const handleReject = (error) => {
  console.log(`Promise was rejected. The error is ${error}`);
}

userCount.then(handleSuccess).catch(handleReject);
```

- `Promise.prototype`上包含一个`.then()`方法
  - 控制台展开打印`console.dir(Promise)`
  - `Promise`实例对象可以通过原型链的方式访问到`.then()`方法`p.then()`
- `.then()`方法(的参数)用来预先指定**成功**和**失败**的回调函数
  - 异步操作都为耗时操作，存在两种结果**成功**或**失败**
  - `p.then(成功的回调函数, 失败的回调函数)`
  - `p.then(result => {}, error => {})`
  - 调用`.then()`方法时，成功的回调函数是必选的，失败的回调函数是可选的

---

> 一个抛硬币的示例

```js
export const coinFlip = (betNum) => {
  return new Promise((resolve, reject) => {
    const hasWon = (Math.random() > 0.5);
    hasWon
      ? setTimeout(() => {
        resolve(betNum * 2);
      }, 2000)
      : reject(new Error("Sorry, You lost...")); // same as -> throw new Error ("You lost ...");

  });
};

coinFlip(10)
  .then(result => {
    console.log(`CONGRATULATIONS! YOU'VE WON ${result}!`);
  })
  .catch(e => {
    console.log(e.message);  // displays the error message if the promise is rejected
                             // in our case: "Sorry, You lost..."
  })

```

### `.then()`链式调用<a href="#catalogue"> ⇧ </a>

> **一个异步操作在另一个异步操作之后执行**的场景，需要处理 Promise chain 期约链

```js
promise
  .then(...)
  .then(...)
  .then(...)
  .catch(...)
```

> 抛硬币的示例

```js
export const coinFlip = (betNum) => {
  return new Promise((resolve, reject) => {
    const hasWon = Math.random() > 0.5;
    hasWon
      ? setTimeout(() => {
        resolve(betNum * 2);
      }, 2000)
      : reject(new Error("Sorry, You lost...")); // same as -> throw new Error ("You lost ...");
  });
};

export const betAgain = (result) => {
  console.log(`CONGRATULATIONS! YOU'VE WON ${result}!`);
  console.log(`LET'S BET AGAIN!`);
  return coinFlip(result);
};

export const handleRejection = (e) => {
  console.log(e.message);
};

coinFlip(10)
  .then(betAgain)
  .then(betAgain)
  .then(betAgain)
  .then(result => {
    console.log(`OMG, WE DID THIS! TIME TO TAKE ${result} HOME!`);
  })
  .catch(handleRejection);
```

- `betAgain`函数接收一个数字，并且展示成功消息，然后再次调用`coinFlip`函数

> 如果只关心最后的结果而忽略过程，在`.then()`方法中只需传递`coinFlip`函数

```js
coinflip(10)
  .then(coinflip)
  .then(coinflip)
  .then(coinflip)
  .then(result => {
    console.log(`OMG, WE DID THIS! TIME TO TAKE ${result} HOME!`);
  })
  .catch(handleRejection);
```

- 调用 `resolve(resultValue)` 就能跳转到 then() 方法就能执行处理代码
- `then(resolveCb, rejectCb)` 回调的返回值又是一个Promise对象
  - 只要是.then() 必然就是执行处理代码
  - 如果还有嵌套必然就是返回一个 Promise 对象
- `.then((result1)=>{..return result2}, (reason)=>{}).then((result2)=>{}, ...)` 形成链式调用
- 链式调用就是 `.then()` 方法的返回值返回一个 `Promise` 对象继续调用 `.then()`
- 此外还有手动包装成 `Promise` 对象的方法：`Promise.resolve()`，可省略，因为链式调用

> 区别 当立即`Promise.resolve()`返回`fulfilled`状态的Promise对象时，**连续链式调用** 与 **分开链式调用** 交替使用

- 微队列-微任务队列；宏队列-宏任务队列

```js
// 运行 node src/promise/promise-then-chain.js
let p1 = Promise.resolve() // sync code
  .then(() => console.log(1) /*return undefined*/) // .resolve(undefined) // Promise {<fulfilled>: undefined}
  .then(() => console.log(2)) // Promise {<pending>}
  .then(() => console.log(3)) // Promise {<pending>}

p1.then(() => console.log(4)) // Promise {<fulfilled>: undefined} .then(....)
p1.then(() => console.log(5))

let p11 = Promise.resolve() // sync code
  .then(() => console.log(11)) // Promise {<fulfilled>: undefined}
  .then(() => console.log(22)) // Promise {<pending>}
  .then(() => console.log(33)) // Promise {<pending>}

p11.then(() => console.log(44))
p11.then(() => console.log(55))

/*
- sync code
  - Promise.resolve() // 返回一个 状态为 fulfilled 的 Promise 对象，可记为pm1
  - pm1.then(() => console.log(1)) // pm1 状态为 fulfilled，所以将 () => console.log(1) 添加到微队列，记为f1，返回一个状态为 pending 的新Promise对象，可记为pm2；此时微队列[f1]
  - pm2.then(() => console.log(2)) // pm2 状态为 pending，所以 () => console.log(2) 未添加到微队列，记为f2，返回一个状态为 pending 的新Promise对象，可记为pm3；此时微队列[f1]
  - pm3.then(() => console.log(3)) // pm3 状态为 pending，所以 () => console.log(3) 未添加到微队列，记为f3，返回一个状态为 pending 的新Promise对象，赋值给p1；此时微队列[f1]
  - p1.then(() => console.log(4)) // p1 状态为 pending，所以 () => console.log(4) 未添加到微队列，记为f4，返回一个状态为 pending 的新Promise对象，未赋值任何变量；此时微队列[f1]
  - p1.then(() => console.log(5)) // p1 状态为 pending，所以 () => console.log(5) 未添加到微队列，记为f5，返回一个状态为 pending 的新Promise对象，未赋值任何变量；此时微队列[f1]
  - Promise.resolve() // 返回一个 状态为 fulfilled 的 Promise 对象，可记为pm11
  - pm11.then(() => console.log(11)) // pm11 状态为 fulfilled，所以 () => console.log(11) 添加到微队列，记为f11，返回一个状态为 pending 的新Promise对象，可记为pm22；此时微队列[f1, f11]
  - pm22.then(() => console.log(22)) // pm22 状态为 pending，所以 () => console.log(22) 未添加到微队列，记为f22，返回一个状态为 pending 的新Promise对象，可记为pm33；此时微队列[f1, f11]
  - pm33.then(() => console.log(33)) // pm33 状态为 pending，所以 () => console.log(33) 未添加到微队列，记为f33，返回一个状态为 pending 的新Promise对象，赋值给p11；此时微队列[f1, f11]
  - p11.then(() => console.log(44)) // p11 状态为 pending，所以 () => console.log(44) 未添加到微队列，记为f44，返回一个状态为 pending 的新Promise对象，未赋值任何变量；此时微队列[f1, f11]
  - p11.then(() => console.log(55)) // p11 状态为 pending，所以 () => console.log(55) 未添加到微队列，记为f55，返回一个状态为 pending 的新Promise对象，未赋值任何变量；此时微队列[f1, f11]
  - 执行栈为空，同步代码执行完毕，扫描微队列[f1, f11]
- 抓取 微队列[f1, f11]中的任务f1到执行栈
  - 执行f1，输出1
  - 将pm2的状态变为 fulfilled，触发将 f2 添加到微队列[f11, f2]
  - 执行栈为空，同步代码执行完毕，扫描微队列[f11, f2]
- 抓取 微队列[f11, f2]中的任务f11到执行栈
  - 执行f11，输出11
  - 将pm22的状态变为 fulfilled，触发将 f22 添加到微队列[f2, f22]
  - 执行栈为空，同步代码执行完毕，扫描微队列[f2, f22]
- 抓取 微队列[f2, f22]中的任务f2到执行栈
  - 执行f2，输出2
  - 将pm3的状态变为 fulfilled，触发将 f3 添加到微队列[f22, f3]
  - 执行栈为空，同步代码执行完毕，扫描微队列[f22, f3]
- 抓取 微队列[f22, f3]中的任务f22到执行栈
  - 执行f22，输出22
  - 将pm33的状态变为 fulfilled，触发将 f33 添加到微队列[f3, f33]
  - 执行栈为空，同步代码执行完毕，扫描微队列[f3, f33]
- 抓取 微队列[f3, f33]中的任务f3到执行栈
  - 执行f3，输出3
  - 将p1的状态变为 fulfilled，触发 p1.then(f4) 将 f4 添加到微队列[f33, f4]
  - p1的状态为 fulfilled，触发 p1.then(f5) 将 f5 添加到微队列[f33, f4, f5]
  - 执行栈为空，同步代码执行完毕，扫描微队列[f33, f4, f5]
- 抓取 微队列[f33, f4, f5]中的任务f33到执行栈
  - 执行f33，输出33
  - 将p11的状态变为 fulfilled，触发 p11.then(f44) 将 f44 添加到微队列[f4, f5, f44]
  - p11的状态变 fulfilled，触发 p11.then(f55) 将 f55 添加到微队列[f4, f5, f44, f55]
  - 执行栈为空，同步代码执行完毕，扫描微队列[f4, f5, f44, f55]
- 抓取 微队列[f4, f5, f44, f55]中的任务f4到执行栈
  - 执行f4，输出4
- 抓取 微队列[f5, f44, f55]中的任务f5到执行栈
  - 执行f5，输出5
- 抓取 微队列[f44, f55]中的任务f44到执行栈
  - 执行f44，输出44
- 抓取 微队列[f55]中的任务f55到执行栈
  - 执行f55，输出55
- 执行栈为空，微队列为空，宏队列为空，全部代码执行完毕

*  连续链式调用 .then().then() 时 的运行机制，为同步执行
*  分开链式调用 p.then(fn) 时 的运行机制，为同步执行
*  交替使用分开的（有中间值的）链式调用 p1.then(fn); p2.then(fn) 时 的运行机制，为同步执行
*  仅当promise状态不为pending，才将对应回调放入微队列
*  状态为fulfilled时，添加fn到微队列；未被添加对微队列是因为状态仍为pending，继续等待状态变化
*
* */

```

- 公理1： 只有当前`Promise`对象`resolve`后，才会触发让其后的`.then(fn)`中的`fn`加入微队列，否则当前`Promise`对象会一直处于`Pending`状态
  - 即 对于一个处于`Pending`状态的`Promise`对象实例p，只有当内部状态`resolved`，才会让`p.then(fn)`中的`fn`加入微队列
- 公理2：（上一个`Promise`对象状态`fulfilled`）执行语句时，默认`return`的是`undefined`，会导致当前`Promise`对象自动`resolve(undefined)` 返回 `Promise {<fulfilled>: undefined}`

> 调整代码，验证

```js
{
let p1 = Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2))
  .then(() => console.log(3))

p1.then(() => console.log(4)).then(() => console.log(5))

let p11 = Promise.resolve()
  .then(() => console.log(11))
  .then(() => console.log(22))
  .then(() => console.log(33))

p11.then(() => console.log(44))
p11.then(() => console.log(55))
}

{
let p1 = Promise.resolve()
  .then(f1) // f1: () => console.log(1)
  .then(f2) // f2: () => console.log(2)
  .then(f3) // f3: () => console.log(3)

p1.then(f4).then(f5) // f4: () => console.log(4) // f5: () => console.log(5)

let p11 = Promise.resolve()
  .then(f11) // f11: () => console.log(11)
  .then(f22) // f22: () => console.log(22)
  .then(f33) // f33: () => console.log(33)

p11.then(f44) // f44: () => console.log(44)
p11.then(f55) // f55: () => console.log(55)
}

/*
- 执行栈
  - Promise.resolve() 返回 pm1<fulfilled>
  - pm1.then(f1) f1加入微队列[f1] 返回 pm2<pending>
  - pm2.then(f2) 返回 pm3<pending>
  - pm3.then(f3) 返回值赋值给p1 p1<pending>
  - p1.then(f4)  返回 pm4<pending>
  - p1.then(f5)  返回 pm5<pending>
  - Promise.resolve() 返回 pm11<fulfilled>
  - pm11.then(f11) f11加入微队列[f1, f11] 返回 pm22<pending>
  - pm22.then(f22) 返回 pm33<pending>
  - pm33.then(f33) 返回值赋值给p11 p11<pending>
  - p11.then(f44)  返回 pm44<pending>
  - p11.then(f55)  返回 pm55<pending>
  - 取f1 pm2<fulfilled> f2加入微队列[f11, f2]
  - 取f11 pm22<fulfilled> f22加入微队列[f2, f22]
  - 取f2 pm3<fulfilled> f3加入微队列[f22, f3]
  - 取f22 pm33<fulfilled> f33加入微队列[f3, f33]
  - 取f3 pm4<fulfilled> f4加入微队列[f33， f4]
  - pm4<fulfilled> f5加入微队列[f33， f4, f5]
  - 取f33 pm44<fulfilled> f4加入微队列[f4, f5, f44]
  - pm44<fulfilled> f55加入微队列[f4, f5, f44, f55]
- 微队列
  - [f1]
  - [f1, f11]
  - [f11, f2]
  - [f2, f22]
  - [f22, f3]
  - [f3, f33]
  - [f33， f4]
  - [f33， f4, f5]
  - [f4, f5, f44]
  - [f4, f5, f44, f55]
  - [f5, f44, f55]
  - [f44, f55]
  - [f55]
  - []
- 宏队列 []
*/


/*
1
11
2
22
3
33
4
44
55
5
*/

{
let p1 = Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2))
  .then(() => console.log(3))

p1.then(() => console.log(4))
p1.then(() => console.log(5))

let p2 = Promise.resolve()
  .then(() => console.log(11))
  .then(() => console.log(22))
  .then(() => console.log(33))

p2.then(() => console.log(44)).then(() => console.log(55))
}

/*
1
11
2
22
3
33
4
5
44
55
*/
```

- 一个 `.then()` 就相当于一层回调嵌套，就是将 **后续所有链式代码** 作为 一整个微任务加入微队列，只不过代码形式上是 链式调用，而执行的逻辑仍然是嵌套执行
- 分开链式调用 `p.then(fn)` 是否将`fn`立即放入微队列取决于`p`的状态是否从`pending`变为`fulfilled`或`rejected`
  - 如果仍是`pending`，就继续等待，暂不放入微队列
  - 如果已有结果，则根据不同结果执行回调逻辑

> 异步操作-宏任务分析

```js
const p = new Promise(function f1(resolve) {
  setTimeout(function f2() {
    resolve(2) // 2传递给下一次.then(resolve(result))中的result
    console.log(1)
  }, 1000) // 得到计数器 1 
}/*, rejectCb*/)

p
  .then(function f3(v) { console.log(v) })
```

- f1 是同步执行代码
  - 执行代码 创建一个定时器，开始计时，f2还未加入宏队列[]
  - 返回一个 pending 状态的 Promise 对象，赋值给p
- 执行下一句 p ，由于状态为 pending， `p.then` 中的回调 不执行
  - f3 **没有立即加入微任务队列**
- 同步代码执行完毕，执行栈[]，微队列[]，宏队列[]
- 扫描微队列，空，扫描宏队列，空
- 1秒后 计时器到时计时完毕，将f2放入宏队列[f2]
- 抓取微任务队列中的任务（为空）到执行栈
- 再扫描宏队列（抓取一个宏任务 f2 到执行栈），执行栈[f2]，宏队列[]
- 执行f2
  - 执行 `resolve(2)`，把Promise的状态从`pending`变为`fulfilled`
    - 返回一个包装成Promise对象的值2
    - 传递值到下一个`.then(resolve(2))`
  - 触发 `p.then(f3)`， 将 f3 移入微队列[f3]
  - 继续 执行 `console.log(1)`，**输出1**
  - 执行栈为空，抓取微任务队列中的任务[f3]到执行栈，执行栈[f3]
- 执行f3，接收`.then(f3(2))`传值2，**输出2**
- 此时执行栈为空，微队列[]，宏队列[]
- 全部代码执行完毕

> 实例：异步宏任务+交替使用有中间值的链式调用分析

```js
let p1 = new Promise(function f1(resolve1/*, reject1*/) {
  setTimeout(resolve1) // macro task 1 // resolve1(undefined)
})
let p2 = p1.then(function f2(v) { console.log(2) }) // thenA
let p3 = p2.then(function f3(v) { console.log(3) }) // thenB

let p11 = new Promise(function f11(resolve2/*, reject2*/) {
  setTimeout(resolve2) // macro task 2
})
let p22 = p11.then(function f22(v) { console.log(22) }) // thenC
let p33 = p22.then(function f33(v) { console.log(33) }) // thenD
```

> 链式调用`.then`之后会返回一个新的`Promise`对象

- 执行同步的代码
  - 运行f1，加入宏队列[resolve1]（f1里面的resolve1函数被加入宏队列，还没开始执行）
  - 立即得到一个pending状态的Promise对象，赋值给p1
  - 运行p1.then，得到一个pending状态的Promise对象，赋值给p2，未放入微队列
  - 运行p2.then，得到一个pending状态的Promise对象，赋值给p3，未放入微队列
- 继续同步代码，同理，运行f11
  - f11里面的resolve2函数被加入宏队列，还没开始执行，此时宏任务队列`[resolve1， resolve2]`
  - 运行p11.then，得到一个pending状态的Promise对象，赋值给p22
  - 运行p22.then，得到一个pending状态的Promise对象，赋值给p33
- 执行栈为空，同步代码执行完毕，此时微队列[]，空，宏队列[resolve1， resolve2]
- 此时微队列为空，所以扫描宏队列，拿出resolve1到执行栈中运行
  - p1被resolve（从pending变成fulfilled）
  - 从而导致p1.then(f2)中的f2被加入微队列[f2]
- 执行栈为空，同步代码执行完毕，此时微队列[f2]，宏队列[resolve2]
- 扫描全部微任务[f2]，拿出f2到执行栈中运行，**输出2**
  - f2运行结束（函数结束或者遇到return）时，触发p2内部状态的变化（p2从pending变成fulfilled）
  - 导致p2.then(f3)中的f3加入微任务队列[f3]
- 执行栈为空，同步代码执行完毕，此时微队列[f3]，宏队列[resolve2]
  - 微任务队列[f3]不为空，拿出f3到执行栈中运行，**输出3**
  - 此时p3变成fulfilled状态，微任务队列为[]
- 执行栈为空，同步代码执行完毕，此时微队列[]，宏队列[resolve2]
- 扫描下一个宏任务，拿出resolve2到执行栈中运行
  - 导致p11被resolve，从而导致p11.then(f22)中的f22被加入微队列[f22]
- 执行栈为空，同步代码执行完毕，此时微队列[f22]，宏队列[]
- 扫描全部微任务，拿出f22运行，**输出22**
  - f22运行结束时，触发p22从pending变成fulfilled，导致p22.then(f33)中的f33加入微队列[f33]
- 执行栈为空，同步代码执行完毕，此时微队列[f33]，宏队列[]
- 微队列还未扫描完，拿出f33到执行栈中运行，**输出33**
- 此时p33变成fulfilled状态，微队列为[]
- 执行栈为空，同步代码执行完毕，此时微队列[]，宏队列[]
- 全部代码执行完毕

> 以上代码等价于常见链式写法

```js
new Promise( resolve => setTimeout(resolve) )
  .then( v => console.log(2) )
  .then( v => console.log(3) )

new Promise( resolve => setTimeout(resolve) )
  .then( v => console.log(22) )
  .then( v => console.log(33) )
```

> 对于一个处于`fulfilled`状态的Promise对象p，`p.then(fn)`会立即让fn加入微任务队列

```js
let p1 = Promise.resolve(1)
let p2 = p1.then(function f2() {
  console.log(2)
})
let p3 = p2.then(function f3() {
  console.log(3)
})

let p11 = new Promise(function f11(resolve) {
  resolve(11)
})
let p22 = p11.then(function f22() {
  console.log(22)
})
let p33 = p22.then(function f33() {
  console.log(33)
})
```

- 执行同步代码
  - `p1 = Promise.resolve(1)`，创建一个内部状态为 fulfilled的Promise对象，赋值给p1
  - `p2 = p1.then(f2)`
    - p1为fulfilled状态的Promise对象
    - 立即让f2加入微任务队列（f2并未执行）
    - 创建的p2是pending状态。此刻微队列为[f2]
  - `p3 = p2.then(f3)`
    - p2为pending状态的Promise对象
    - 内部resolve才会让f3加入微队列
    - 因为p2还没resolve，所以f3还没加微队列
  - `p11 = new Promise(function f11(resolve){ resolve(11) })`
    - 创建一个内部状态为fulfilled的Promise对象，赋值给p11
  - `p22 = p11.then(f22)`
    - p11为fulfilled状态的Promise对象
    - 立即让f22加入微任务队列（f22并未执行）
    - 创建的p22是pending状态。此刻微队列是[f2, f22]
  - `p33 = p22.then(f33)`
    - p22为pending状态的Promise对象
    - 内部resolve才会让f33加入微队列
    - 因为p22还没fulfilled，所以f33还没加微队列
- 同步代码执行完毕，执行栈[]，微队列[f2, f22]，宏队列[]
- 扫描微队列
  - 拿出f2运行，**输出2**
    - f2执行完时（函数结束或者遇到return），p2被resolve（变成fulfilled状态）
    - 触发f3加入微队列。此刻微队列为[f22, f3]
  - 拿出f22运行，**输出22**
    - f22执行完时，p22被resolve
    - 触发f33加入微队列。此刻微队列为[f3, f33]
  - 拿出f3运行，**输出3**
    - f3执行完，p3变成fulfilled状态
  - 拿出f33运行，**输出33**
  - f33执行完，p33变成fulfilled状态
- 全部代码执行完毕

> 以上代码等价于常见链式写法

```js
Promise.resolve(1)
  .then(() => console.log(2))
  .then(() => console.log(3))

new Promise(resolve => resolve())
  .then(() => console.log(22))
  .then(() => console.log(33))
```

### `Promise.prototype.then`的应用场景

- 应用场景1：下个请求依赖上个请求的结果
- 应用场景2：中间件功能使用

---

#### 应用场景1：**下个请求依赖上个请求的结果**

> 描述：类似微信小程序的登录

- 首先 执行微信小程序的 登录 `wx.login` ，返回了 `code`
- 然后调用后端写的登录接口，传入 `code`
- 然后返回 `token`
- 然后每次的请求都必须携带 `token`
- 即下一次的请求依赖上一次请求返回的数据

```js
function A() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('B依赖的数据')
    }, 300)
  })
}

function B(prams) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(prams + 'C依赖的数据')
    }, 500)
  })
}

function C(prams) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(prams)
    }, 1000)
  })
}

// 期望的是走 try
// 由于A B C模拟的请求中都是没有reject
// 用 try catch 捕获错误
try {
  A()
    .then(res => B(res))
    .then(res => C(res))
    .then(res => {
      console.log(res) // B依赖的数据C依赖的数据
    })
} catch (e) {
  console.log(e)
}

```

#### 应用场景2：中间件功能使用

> 描述：接口返回的数据量比较大，在一个then 里面处理 显得臃肿，多个渲染数据分别给多个then，让其各司其职

```js
//模拟后端返回的数据
const result = {
  bannerList: [
    {img: '轮播图地址'}
    //...
  ],
  storeList: [
    {name: '店铺列表'}
    //...
  ],
  categoryList: [
    {name: '分类列表'}
    //...
  ]
  //...
}

function getInfo() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(result)
    }, 500)
  })
}

// 传递统一个 res ，分步从res中取出数据
getInfo()
  .then(res => {
    const {bannerList} = res
    // 渲染轮播图
    console.log(bannerList)
    return res
  })
  .then(res => {
    const {storeList} = res
    // 渲染店铺列表
    console.log(storeList)
    return res
  })
  .then(res => {
    const {categoryList} = res
    console.log(categoryList)
    // 渲染分类列表
    return res
  })

```

---

### `Promise` 实例中参数的调用机制<a href="#catalogue"> ⇧ </a>

> `new Promise((resolve, reject) => {})` 中的 `resolve` 和 `reject` 方法，在异步代码中调用

- 由于JS是单线程，会优先在主线程执行同步代码
- 异步代码会放到任务队列中
- 所以在刚运行时，Promise实例为 pending(进行中) 状态
- 等待主线程执行完毕，任务队列通知主线程，异步任务可以执行了，该任务才会进入主线程执行
- 此时setTimeout中的回调函数被调用，执行了resolve() 或 reject() 方法
- Promise实例会随之改变状态,并存储传入的数据

> `resolve()`、 `reject()` 方法，不可重复调用

- 实例的一旦状态改变，就不会再变
- Promise 对象的状态改变，只有两种可能：从 pending 变为 fulfilled 和从 pending 变为 rejected
- 只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 settled（已定型）

> 由此可见 Promise 本质，就是一个状态机

- 当该 Promise 对象创建出来之后，其状态就是 pending(进行中)
- 然后通过程序来控制到底是执行已完成，还是执行已失败
- 因为 Promise 处理的是异步任务，当 Promise 的状态发生变化时，需要后续执行相应的函数(then/catch/finally)

---

### `Promise`的缺点<a href="#catalogue"> ⇧ </a>

- 无法取消，一旦新建它就会立即执行，无法中途取消
- 不设置回调函数，Promise 内部抛出的错误，不会反应到外部
- 当处于 pending 状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）

> `AbortSignal API`

- promise 一旦初始化，就不能中止
- `AbortSignal`的出现使 `promise` 从语义上变为可中止的
- `fetch API` 的 `AbortController`接口已经集成了`AbortSignal`

> 解决方案参考

- [AbortSignal promise](https://juejin.cn/post/7013558331520335880)
- [扩展 Promise 实现可取消、进度通知](https://juejin.cn/post/7044526741758410789?utm_source=gold_browser_extension)
- [面试官：如何中断已发出去的请求？](https://juejin.cn/post/7033906910583586829)
- [给你一个可以中断的Promise](https://juejin.cn/post/7043348598595158030?utm_source=gold_browser_extension)
- [axios解析之cancelToken取消请求原理](https://juejin.cn/post/7044532592640524324)

---

## 异步操作之基于`then-fs`异步的读取文件内容<a href="#catalogue"> ⇧ </a>

> 创建三个文本

```sh
files
 ┣ 1.txt
 ┣ 2.txt
 ┗ 3.txt
```

### 方式一：基于 **回调函数** 按顺序读取文件内容<a href="#catalogue"> ⇧ </a>

> `callback.js`使用`Node.js`的文件读取模块`fs.readFile()`

```js
// 如果在`package.json`中设置了`"type": "module"`
// 删除或改为`"type": "commonjs"`
const fs = require('fs');

// 读取文件 1.txt
fs.readFile('./files/1.txt', 'utf8', (error1, result1) => {
  if (error1) return console.log(error1.message) // 读取文件 1.txt 失败
  console.log(result1) // 读取文件 1.txt 成功

  // 读取文件 2.txt
  fs.readFile('./files/2.txt', 'utf8', (error2, result2) => {
    if (error2) return console.log(error2.message) // 读取文件 2.txt 失败})
    console.log(result2) // 读取文件 2.txt 成功

    // 读取文件 3.txt
    fs.readFile('./files/3.txt', 'utf8', (error3, result3) => {
      if (error3) return console.log(error3.message) // 读取文件 3.txt 失败})
      console.log(result3) // 读取文件 3.txt 成功
    })

  })

})

```

- 使用命令行运行`node callback.js`
- 缺点明显是形成了回调地狱
- 注意如果报错 `ReferenceError: fs is not defined`
  - 说明在`package.json`中设置了`"type": "module"`，删除或改为`"type": "commonjs"`
  - 在前面加上`const fs = require('fs');`

---

### 方式二：基于 **`then-fs`** 读取文件的内容<a href="#catalogue"> ⇧ </a>

> 由于 `Node.js`官方提供的`fs`模块**仅支持**以**回调函数**的方式读取文件，不支持 **Promise的调用方式**

- 需要先安装第三方包：`then-fs`，从而支持基于`Promise`的方式读取文件的内容
- `yarn add then-fs`

> 导入并使用`then-fs`读取文件

```js
import thenFs from 'then-fs'

// .then() 中的失败回调是可选的，可被省略
thenFs.readFile('./files/1.txt', 'utf8')
  .then(rt1 => console.log(rt1), err1 => console.log(err1))

thenFs.readFile('./files/2.txt', 'utf8')
  .then(rt2 => console.log(rt2), err2 => console.log(err2))

thenFs.readFile('./files/3.txt', 'utf8')
  .then(rt3 => console.log(rt3), err3 => console.log(err3))
```

- 调用`then-fs`提供的`readFile()`方法，可以异步地读取文件的内容
- `.readFile()`的返回值是`Promise`的实例对象
- 因此可以继续调用`.then()`方法为每个`Promise`异步操作指定成功和失败之后的回调函数
- 各个`thenFs.readFile().then()`之间**无法保证文件的读取顺序**，即乱序读取，相当于同时开启了三个异步操作
- 不能保证 精确地控制读取结果的顺序，需要进一步优化

### 方式三：基于`Promise`链式调用按顺序读取文件的内容<a href="#catalogue"> ⇧ </a>

> `.then()`方法的特性

- 只有上一个`.then()`中返回了一个新的`Promise`实例对象，才可以通过下一个`.then()`继续进行处理
- 通过`.then()`方法的 链式调用，就解决了回调地狱的问题

```js
import thenFs from 'then-fs'

thenFs.readFile('./files/1.txt', 'utf8') // 1. 返回值是 Promise 的实例对象
  .then(rt1 => { // 2. 通过 .then 为第一个 Promise 实例指定充公之后的回调函数
    console.log(rt1)
    return thenFs.readFile('./files/2.txt', 'utf8') // 3. 在第一个 .then 中返回一个新的 Promise 实例对象
  })
  .then(rt2 => { // 4. 继续调用 .then 为上一个 .then 的返回值（新Promise实例）指定成功之后的回调函数
    console.log(rt2)
    return thenFs.readFile('./files/3.txt', 'utf8') // 5. 在第二个 .then 中再返回一个新的 Promise 实例对象
  })
  .then(rt3 => { // 6. 继续调用 .then 为上一个 .then 的返回值（新Promise实例）指定成功之后的回调函数
    console.log(rt3)
  })

/*
// 折起代码可以更清楚地观察到以同步的形式进行异步操作
thenFs.readFile('./files/1.txt', 'utf8')
  .then(() => thenFs.readFile('./files/2.txt', 'utf8'))
  .then(() => thenFs.readFile('./files/3.txt', 'utf8'))
  .then(() => {...})
*/

```

- 注意链式调用必须在回调函数中要返回 Promise 实例对象（异步操作）
- 可以精确控制异步操作的顺序

---

### 通过 `.catch` 方法捕获错误<a href="#catalogue"> ⇧ </a>

> 如果 Promise 的链式操作中发生错误，可以使用 `Promise.prototype.catch` 方法进行捕获和处理

```js
import thenFs from 'then-fs'

thenFs.readFile('./files/11.txt', 'utf8') // 文件不存在导致读取失败
  // 之后 3个 .then 的链式操作都不执行
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
  // 捕获第一个异步操作的错误，并输出错误信息
  .catch(err => {
    console.log(err.message);
  })

//ENOENT: no such file or directory, open 'F:\Documents\jirengu\test-node-module\files\11.txt'
```

> 如果不希望前面的错误导致后续的 `.then()` 无法执行，则可以将 `.catch` 的调用提前到第一个异步操作后

```js
import thenFs from 'then-fs'

thenFs.readFile('./files/11.txt', 'utf8') // 文件不存在导致读取失败
  // 提前捕获第一个异步操作的错误，并输出错误信息
  .catch(err => {
    console.log(err.message);
  })
  // 之后 3个 .then 的链式操作都正常执行
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

- `catch()` 方法是 `.then(null, rejection)` 或 `.then(undefined, rejection)` 的别名，用于指定发生错误时的回调函数
- `new Promise`的时候
  - 如果在`.then`中传了第二个参数，并捕获了`reject`的报错，那么`.catch`捕获的只有`resolve`抛出的异常
  - 如果`.then`没有传第二个参数，说明`.then`中仅处理`resolve`，那么`.catch`将捕获`reject`信息和`resolve`的异常

---

## 总结在 JS Promises 中的错误处理<a href="#catalogue"> ⇧ </a>

> 有一个 `getUserData(userId)` 函数，返回关于用户的信息，或者如果 userId 参数有问题的话会抛出一个错误
>
> 以前的处理方式是添加常规的 try/catch 并且在 catch 块中处理错误

```js
try {
  console.log(getUserData(userId));
} catch (e) {
  handleError(e);
}
```

- 但是使用常规的 `try/catch` **不能在 Promise 的异步代码中捕获出现的错误**
- 在同步代码中不会有问题，所以执行将会被继续
- 但在异步代码中出现错误时，将收到一个 `UnhandledPromiseRejection`，并且程序将终止

> 增加一个 finally 的块可以更好地理解

```js
try {
  fetchUserData(userId).then(console.log);
} catch (e) {
  handleError(e);
} finally {
  console.log('finally');
}
```

1. 在 try 块中调用了一个 fetchUserData 函数，它将在 Pending 状态返回一个 Promise
2. 这个 catch 块会被忽视，因为在 try 块中没有错误。异步语句还没有运行
3. finally 行显示在屏幕上
4. 在异步代码中出现了一个错误，并且在控制台上的错误信息—— UnhandledPromiseRejectionWarning

> 为了避免 Promises 中出现未处理的 Rejections，应该总是在 catch 中处理

```js
fetchUserJavaScriptData(userId).then(console.log).catch(handleError);
```

> 区分以下两种在 Promise 中提供的错误处理函数回调的方式

```js
const f1 = (promise, successHandler, errorhandler) => {
    return promise.then(successHandler, errorHandler)
}
const f2 = (promise, successHandler, errorhandler) => {
    return promise.then(successHandler).catch(errorHandler)
}
```

- 当原先的 `promise` 的状态变为`rejected`时，`f1` `f2`的`errorHandler`都会执行
- 当原先的 `promise` 的状态变为`resolve`时，执行成功的回调函数`successHandler`
- 当 `successHandler` 中抛出错误，将只会在`f2`的`.catch(errorHandler)`中得到错误信息

```js
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('hello')
  }, 1000)
  })
  .then(res => {
    console.log(res) // 打印hello
    return res + ' world'
  })
  .then(res => {
      console.log(res)
      // return Promise.reject('error message') // 发生异常
      throw 'error message' // 抛出异常
  })
  .then(res => {
    console.log(res) // 打印hello world
  }).catch(error => {
    console.log(error) // 接收throw抛出的异常信息
  })

```

> 小结

- `.then` 的第二个参数，即接收错误处理的回调 `rejectCb`，只能处理 **它之前的 `promise` 的 `reject` **
- `.catch` 可以处理之前 `Promise` 链上所有的错误，包括 在 `.then()` 中的 `resolve` 成功回调函数中的错误
- 可以通过 throw 抛出异常

---

## Promise 的静态方法<a href="#catalogue"> ⇧ </a>

> Promise 静态方法，即将封装的方法存储在构造函数Promise上，由构造函数自身调用

- `Promise.all()`、`Promise.race()`、`Promise.allSettled()`、`Promise.any()`方法相同点为用于将多个 Promise 实例，包装成一个新的 Promise 实例

> 处理多个异步操作，将多个异步操作写在数组中 `promise-arr.js`

```js
import thenFs from 'then-fs'

export const promiseArrOK = [
  thenFs.readFile('./files/1.txt', 'utf8'),
  thenFs.readFile('./files/2.txt', 'utf8'),
  thenFs.readFile('./files/3.txt', 'utf8')
]

export const promiseArrOKReversal = [
  thenFs.readFile('./files/3.txt', 'utf8'),
  thenFs.readFile('./files/2.txt', 'utf8'),
  thenFs.readFile('./files/1.txt', 'utf8')
]

export const promiseArrErr = [
  thenFs.readFile('./files/11.txt', 'utf8'),
  thenFs.readFile('./files/2.txt', 'utf8'),
  thenFs.readFile('./files/3.txt', 'utf8')
]

export const promiseArrFail = [
  thenFs.readFile('./files/11.txt', 'utf8'),
  thenFs.readFile('./files/22.txt', 'utf8'),
  thenFs.readFile('./files/33.txt', 'utf8')
]

```

### 静态方法方法的使用<a href="#catalogue"> ⇧ </a>

- `Promise.resolve(value)` **返回**一个状态由给定 value 决定的**Promise对象**
- `Promise.reject(reason)` **返回**一个状态为 reject 的**Promise对象**，并将 reason 传递给对应的处理方法
- `Promise.all()`
- `Promise.race()`
- `Promise.allSettled()`
- `Promise.any()`
- `Promise.prototype.finally()`

---

#### `Promise.resolve()`

- `Promise.resolve(x)` 可以看作是 `new Promise(resolve => resolve(x))` 的简写，可以用于快速封装字面量对象或其他对象，将其封装成 Promise 实例

#### `Promise.all()`<a href="#catalogue"> ⇧ </a>

> 业务需要请求2个地方（A和B）的数据，只有A和B的数据都拿到才能走下一步
>
> 网络请求A和网络请求B返回先后顺序未知，所以需要定义一个函数只有2个请求都返回数据才回调成功

##### `Promise.all()` 基本语法<a href="#catalogue"> ⇧ </a>

```js
const p = Promise.all([p1, p2, p3]);
```

- 返回一个 **新的 promise 对象**
- `Promise.all()`方法可接受一个数组作为参数，一般地 p1、p2、p3 都是 Promise 实例对象
  -  p1、p2、p3 **互相独立，参数之间不能相互依赖**
  - 如果不是，会自动先调用下 `Promise.resolve()` 方法，将参数转为 Promise 实例，再进一步处理
- `Promise.all()`方法的参数可以不是数组，但必须具有 Iterator 接口，且一般返回的每个成员都是 Promise 实例
  - 如果传递的 Iterable 为空，则返回一个已经解决的 Promise
    - `Promise.all([]).then(res=>{console.log(res) // []})`
  - 如果传递的 Iterable 不包含 Promise
    - `Promise.all([1,2,3]).then(res=>{console.log(res) // [1,2,3]})`
- p 的状态由`p1、p2、p3`决定，分成两种情况
  - 1）只有`p1、p2、p3`的状态都变成`fulfilled`，p 的状态才会变成`fulfilled`，此时`p1、p2、p3`的返回值组成一个数组，传递给 p 的回调函数。
  - 2）只要`p1、p2、p3`之中只要有一个被`rejected`，p 的状态就变成`rejected`，此时 **第一个被reject的实例** 的返回值，会传递给 p 的回调函数
- 相较于 `.then()` 方法的链式操作，`Promise.all()` 更注重并发
  - 即依次按顺序发送多个请求，等待所有的请求均成功之后，将结果按顺序将数据依次存放到数组中返回

```js
// 当给定可迭代对象中的所有 promise 已解决
const p1 = new Promise((resolve, reject) => {
    resolve(1)
})
const p2 = new Promise((resolve, reject) => {
    resolve(2)
})

Promise.all([p1, p2, 3])
  .then(res => {
    console.log(res) // [1, 2, 3]
  })

// 当给定可迭代对象中的任何 promise 被拒绝时
const q1 = new Promise((resolve, reject) => {
    resolve(1)
})
const q2 = new Promise((resolve, reject) => {
    reject(2)
})

Promise.all([q1, q2, 3])
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.log(err)  // 2
  })

```

> 此方法对于汇总多个 promise 的结果很有用， 在ES6中可以将多个 `Promise.all` 异步请求并行操作：

- 当所有结果成功返回时按照请求顺序返回成功
- 当其中有一个失败方法时，则进入失败方法


##### `Promise.all()` 运行机制<a href="#catalogue"> ⇧ </a>

> `Promise.all()`会发起并行的 Promise 异步操作，用于将多个 Promise 实例，包装成一个新的 Promise 实例
>
> 等所有的**异步操作全部结束后**才会执行下一步的 .then 操作
>
> 即**等待机制**

```js
import { promiseArrOK, promiseArrOKReversal, promiseArrErr, promiseArrFail } from './promise-arr.js'

// 以异步操作数组为参数
Promise.all(promiseArrOK)
  .then(([r1, r2, r3] /* 形参解构 */) => { // 等待所有异步操作成功的结果
    console.log(r1, r2, r3)
  })

Promise.all(promiseArrOKReversal)
  .then((result) => { // 等待所有异步操作成功的结果
    console.log(result)
  })

Promise.all(promiseArrErr)
  .then(([r1, r2, r3]) => { // 等待所有异步操作成功的结果
    console.log(r1, r2, r3)
  })
  // 捕获 Promise.all 异步操作数组中的错误
  .catch((err) => {
    console.log(err.message);
  })

Promise.all(promiseArrFail)
  .then((...result) => { // 等待所有异步操作成功的结果
    console.log(result)
  })
  .catch((err) => {
    console.log(err.message);
  })

```

- `Promise.all()` 参数数组中 Promise 实例的顺序，就是最终结果的顺序
- `Promise.all()` 本身也是异步操作
- 多个 `Promise.all()` 运行看哪个先被执行，就先打印哪个

##### `Promise.all()` 的 `Polyfill`<a href="#catalogue"> ⇧ </a>

```js
Promise.prototype.myAll = function (list /* : Array<Promise> */) {
  const arr = []
  // 返回一个新的Promise实例
  return new Promise(function (resolve, reject) {
    for (let i = 0; i < list.length; i++) {
    　// 获取每一个　Promise　实例
      // 如果传入的数据为非 Promise 实例 会自动通过 Promise.resolve 转化Promise实例
      let p = list[i]
      // 每一个实例的成功和失败时执行的内容  => 请求有结果之后会执行
      p
        .then(res => {
          // 等待异步操作有结果之后 对应下标放到数组中
          arr[i] = res

          // 所有的请求全都成功
          arr.length === list.length
            ? resolve(arr)
            : null

        })
        .catch(err => {
          // 只要有一个失败 就走catch // console.log(err)
          reject(err)
        })
    }
  
  })
}

```

---

##### 为什么使用 `Promise.all()`<a href="#catalogue"> ⇧ </a>

- 假设有一个异步方法`getUserData()`，返回包含用户名、id、好友id列表的 Promise 对象

```js
{
  id: 125,
  name: 'Jack Jones',
  friends: [1, 23, 87, 120]
}
```

- 当此 Promise 实例对象的状态变为`fulfilled`后才能接收到数据
- 需要进一步按照好友id展示好友的所有数据
- 使用一个 Promise 实例对象来获得好友id列表

```js
getUserData(userId).then(console.log);
```

- 使用`Array.prototype.map()`分别打印出每个好友的数据

```js
getUserData(userId)
  .then(userData => {
    return userData.friends.map(getUserData);
    // [1, 23, 87, 120].map(getUserData)
  })
  .then(console.log)
  .catch(e => console.log(e.message));
```

- 但只能得到`[Promise {<pending>}, Promise {<pending>}, Promise {<pending>}]`
- 列表中每项都是一个 `pending` 状态的 `Promise`，而不是数据

> 使用`Promise.all(Array<Promise>)` 接收promise对象数组，并返回一个单独的promise对象

- 当`Promise.all`中所有的promise对象都变为`fulfilled`时，`Promise.all`返回的promise对象的状态才变为`fulfilled`
- `Promise.all`中任意一个promise对象变为`rejected`时，`Promise.all`返回的promise对象的状态就会变为`rejected`

```js
getUserData(userId)
   .then(userData => {
     return Promise.all(userData.friends.map(getUserData));
     // Promise.all([1, 23, 87, 120].map(getUserData))
   })
   .then(console.log)
   .catch(e => console.log(e.message));
```

- 需要在最后同时得到多个promise对象返回的数据时使用
- 可以合并允许并行执行的异步操作，避免过渡使用`async/await`造成的性能与代码执行效率的下降

> `Promise.al1` 一些应用场景

- 应用场景1：多个请求结果合并在一起
- 应用场景2：合并请求结果并处理错误
- 应用场景3：验证多个请求结果是否都是满足条件

##### `Promise.al1` 应用场景1：多个请求结果合并在一起

> 具体描述：一个页面，有多个请求，需求所有的请求都返回数据后，再一起处理渲染

- 每个请求的 loading 状态如果单独设置，多个的话可能导致多个 loading 重合
- 页面显示的内容，根据请求返回数据的快慢有所差异，具体表现在渲染的过程
- 为提升用户体验，可以采用所有请求返回数据后，再一起渲染
- 关闭请求的单独 loading 设置，通过 Promise.all 汇总请求结果
- 从开始到结束，只设置一个 loading 即可

```js
// 1. 获取轮播数据列表
function getBannerList() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('轮播数据')
    }, 300)
  })
}

// 2. 获取店铺列表
function getStoreList() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('店铺数据')
    }, 500)
  })
}

// 3. 获取分类列表
function getCategoryList() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('分类数据')
    }, 700)
  })
}

function initLoad() {
  // loading.show() // 加载loading
  Promise.all([
  getBannerList(), 
  getStoreList(), 
  getCategoryList()
  ])
  .then(res => {
    console.log(res)
    // loading.hide() // 关闭loading
  })
  .catch(err => {
    console.log(err)
    // loading.hide() // 关闭loading
  })
}

// 数据初始化
initLoad()
```

##### `Promise.all`应用场景2：合并请求结果并处理错误

> 描述：需求单独处理一个请求的数据渲染和错误处理逻辑
>
> 有多个请求，就需要在多个地方写，逻辑分散，维护麻烦

- 能否把多个请求合并在一起，哪怕有的请求失败了，也捕获错误信息返回
- 只需要在一个地方处理这些数据和错误的逻辑即可

```js
// 1.获取轮播图数据列表
function getBannerList() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      // resolve('轮播图数据')
      reject('获取轮播图数据失败啦')
    }, 300)
  })
}

// 2.获取店铺列表
function getStoreList() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('店铺数据')
    }, 500)
  })
}

// 3.获取分类列表
function getCategoryList() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('分类数据')
    }, 700)
  })
}

function initLoad() {
  // loading.show()
  Promise.all([
    getBannerList().catch(err => err),
    getStoreList().catch(err => err),
    getCategoryList().catch(err => err)
  ])
    .then(res => {
      console.log(res)
      // ["获取轮播图数据失败啦", "店铺数据", "分类数据"]

      // 判断返回数组结果
      res[0] === '轮播图数据'
        ? render()
        : catchError() // 获取 轮播图数据 失败的逻辑

      res[1] === '店铺数据'
        ? render()
        : catchError() // 获取 店铺列表数据 失败的逻辑

      res[2] === '分类数据'
        ? render()
        : catchError() // 获取 分类列表数据 失败的逻辑

      // loading.hide()
    })
    .finally(
      loading.hide()
    )
}

initLoad()

```

- 有时候页面挂掉了，可能因为接口异常导致，或许只是一个无关紧要的接口挂掉了
- 找到一个接口挂掉了导致整个页面无数据的原因就需要用到 `Promise.all`
- 如果参数中 promise 有一个失败（rejected）
  - 此实例回调失败（reject）
  - 就不再执行then方法回调
- 以上用例 正好可以解决此种问题

##### `Promise.all`应用场景3：**验证** 多个请求结果是否都是满足条件

> 描述：在一个微信小程序项目中，做一个表单输入内容安全验证
>
> 调用的是云函数写的方法，表单有多7个字段需要验证
>
> 统一调用一个 内容安全校验接口
>
> 全部验证通过才可以进行正常的提交

```js
function verify1(content) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve(true)
    }, 200)
  })
}

function verify2(content) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve(true)
    }, 700)
  })
}

function verify3(content) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve(true)
    }, 300)
  })
}


Promise.all([
  verify1('校验字段1的内容'),
  verify2('校验字段2的内容'),
  verify3('校验字段3的内容')
])
  .then(result => {
    console.log(result)
    // [true, true, true]

    const verifyResult = result.every(item => {..return..})
    // 验证结果
    console.log(verifyResult ? '通过验证' : '未通过验证') // 通过验证
  })
  .catch(err => {
  console.log(err)
})
```

---

#### `Promise.race()`<a href="#catalogue"> ⇧ </a>

##### `Promise.race()`基本语法<a href="#catalogue"> ⇧ </a>

```js
const p = Promise.race([p1, p2, p3]);
```

- 只要`p1、p2、p3`之中有一个实例率先改变状态，p 的状态就跟着改变
- 率先改变的 Promise 实例的返回值，就传递给 p 的回调函数
- 语法：`Promise.race（iterable)`
- 参数: iterable 可迭代的对象，例如 Array。可迭代的
- 返回值： `Promise.race(iterable)` 方法返回一个 promise
  - 一旦迭代器中的某个 promise 解决或拒绝，返回的 promise就会解决或拒绝
  - 即其中任何一个 promise **最先** 返回的结果（成功或失败）就是 `Promise.race（iterable)` 的结果
- `Promise.race（iterable)` 函数返回一个 Promise
  - 它将与第一个传递的 promise 相同的完成方式被完成
  - 它可以是完成（ resolves），也可以是失败（rejects）
  - 这要取决于第一个完成的方式是两个中的哪个
- 如果传的迭代是 **空的**，则返回的 promise 将永远等待
- 如果迭代包含 **一个或多个非承诺值和/或已解决/拒绝的承诺**
  - 则 `Promise.race()` 将解析为迭代中找到的 **第一个值**

---

##### `Promise.race()`示例<a href="#catalogue"> ⇧ </a>

> `Promise.race()`也会发起并行的 Promise 异步操作
>
> 只要 **任意一个异步操作结束后** 就立即执行下一步的 `.then()` 操作
>
> 即**赛跑/竞态机制**

```js
import { promiseArrOK, promiseArrOKReversal, promiseArrErr, promiseArrFail } from './promise-arr.js'

// 以异步操作数组为参数
Promise.race(promiseArrOK)
  .then(result => { // 只要任何一个异步操作完成，就立即执行成功的回调函数
    console.log(result);
  })

Promise.race(promiseArrOKReversal)
  .then(result => {
    console.log(result);
  })

Promise.race(promiseArrErr)
  .then(result => {
    console.log(result);
  })
  .catch(err => {
    console.log(err.message);
  })

Promise.race(promiseArrFail)
  .then(result => {
    console.log(result);
  })
  .catch(err => {
    console.log(err.message);
  })

```

- `Promise.race(iterable)` 方法返回一个 promise
  - 一旦迭代器中的某个promise解决或拒绝，返回的 promise 就会解决或拒绝
- 通过 `Promise.race`，能够达到当传入的 Promise 数组中的任意一个 Promise 达到了解决或拒绝时，就无视 Promise 数组中的其他 Promise 的结果的目的

##### `Promise.race` 的 `Polyfill`<a href="#catalogue"> ⇧ </a>

```js
Promise.prototype.myRace = function (list /* : Array<Promise> */) {
  return new Promise(function (resolve, reject) {
    for (let i = 0; i < list.length; i++) {
      // 获取每一个 Promise 实例
      // 如果传入的数据非 Promise 实例 会自动通过　Promise.resolve　转化 Promise 实例
      let p = list[i]
      p.then(res => {resolve(res)})
        .catch(err => {reject(err)})
    }
  })
}

```

##### 为什么使用 `Promise.race()`<a href="#catalogue"> ⇧ </a>

- `Promise.race(Array<Promise>)`等待最先成功的promise对象，只要有一个先成功就忽略其他所有promise对象
- 接收promise对象数组，并返回一个单独的promise对象
- 实际使用时无法事先预测其中哪个promise对象状态会第一个变为`fulfilled`并返回值

```js
const fastPromise = new Promise((resolve, reject) => {
  setTimeout(() => resolve(`fast`), 100);
});

const slowPromise = new Promise((resolve, reject) => {
  setTimeout(() => resolve(`slow`), 200);
});

const arr = [fastPromise, slowPromise];

Promise.race(arr).then(console.log); // fast
```

> `Promise.race()`应用场景

- 应用场景1：图片请求超时
- 应用场景2：请求超时提示

##### `Promise.race()`应用场景1：图片请求超时

```js
//请求某个图片资源
function requestImg() {
  return new Promise( (resolve, reject) =>{
    // 功能等价于 document.createElement('img')
    // Image() 函数将会创建一个新的HTMLImageElement实例
    // 见MDN https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLImageElement/Image
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }
    //img.src = "https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-assets/v3/static/img/logo.a7995ad.svg~tplv-t2oaga2asx-image.image"; 正确的
    img.src = 'https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-assets/v3/static/img/logo.a7995ad.svg1~tplv-t2oaga2asx-image.image'
  })

}

// 延时函数，用于给请求计时，限制请求时间
function timeout() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('图片请求超时')
    }, 5000)
  })
}

Promise
  .race([
    requestImg(),
    timeout()
  ])
  .then((results) => {
    console.log(results)
  })
  .catch((reason) => {
    console.log(reason)
  })

```

##### `Promise.race()`应用场景2：请求超时提示

> 描述：有些时候，前一秒刷着新闻，下一秒进入电梯后，手机页面上就会提示 “网络不佳”

```js
// 请求
function request() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('请求成功')
    }, 4000)
  })
}

// 请求超时提醒 限制请求时间
function timeout() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('网络不佳')
    }, 3000)
  })
}

Promise.race([
  request(),
  timeout()
])
  .then(res => {
    console.log(res)
  })
  .catch(err => {
  console.log(err) // 网络不佳
})

```

---

#### `Promise.allSettled()`<a href="#catalogue"> ⇧ </a>

##### `Promise.allSettled()`基本语法<a href="#catalogue"> ⇧ </a>

```js
const p = Promise.allSettled([p1, p2, p3]);
```

- 无论哪一个Promise实例是成功还是失败，都会将结果依次按请求顺序放到数组中

---

#### `Promise.any()`<a href="#catalogue"> ⇧ </a>


#### `Promise.prototype.finally()`

- `Promise.prototype.finally()` 方法用于给期约添加 onFinally 处理程序
- 在期约转换为 **解决** 或 **拒绝** 状态时都会执行
- 这个方法可以避免 onResolved 和 onRejected 处理程序中出 现冗余代码
- 将必定会执行的逻辑统一集中
- 但 onFinally 处理程序没有办法知道期约的状态是 解决 还是 拒绝，所以这个方法主要用 于添加清理代码

```js

```

---

## 基于`Promise`封装异步读文件的方法<a href="#catalogue"> ⇧ </a>

### 形式上的异步操作<a href="#catalogue"> ⇧ </a>

> 方法的要求

- 命名为 `getFile`
- 需要接受一个形参`filePath`，表示要读取文件的路径
- 返回值为 Promise 实例对象

> 方法的基本定义

```js
function getFile(filePath) {
    return new Promise()
}
```

- `return new Promise()`只是创建了一个**形式上的异步操作**
- **实例化 new Promise(Cb) 实例中的回调函数Cb为同步任务**

### 创建具体的异步操作<a href="#catalogue"> ⇧ </a>

> 创建具体的异步操作，需要在 `new Promise()` 构造函数期间，传递一个 `function` 函数作为参数
>
> 将具体的异步操作定义到 这个 function 函数内部
>
> `promise-getFile.js`

```js
export function getFile(filePath) {
  return new Promise(
    function () {
    // 具体的异步操作
      fs.readFile(filePath, 'utf8', function (err, dataStr) { })
    }
  )
}
```

#### 获取 .then 的两个实参<a href="#catalogue"> ⇧ </a>

> 通过 .then() 预先指定的成功和失败的回调函数，可以在 function 的形参中进行接收

```js
export function getFile(filePath) {
  // 形参 resolve：调用 getFile()方法时，通过 .then 指定的“成功的”回调函数
  // 形参 reject：调用 getFile()方法时，通过 .then 指定的“失败的”回调函数
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, 'utf8', function (err, data) { })
  })
  
}

// getFile 方法的调用过程
getFile('./files/1.txt').then(resolveHandler, rejectHandler)
  // .then(用户指定成功的回调函数， 用户指定失败的回调函数)
```

- 在`.then(用户指定成功的回调函数， 用户指定失败的回调函数)`中传入`resolve， reject`作为`new Promise(function (resolve, reject) {}`形参列表的两个实参
- 在`new Promise(function (resolve, reject) {}`中
  - 通过`resolve`接收 .then 中用户指定成功的回调函数 `resolveHandler`
  - 通过`reject`接收 .then 中用户指定失败的回调函数 `rejectHandler`
- 当一个Promise被创建时，回调被立即执行

#### 调用 resolve 和 reject 回调函数<a href="#catalogue"> ⇧ </a>

> Promise 异步操作的结果，可以调用 resolve 或 reject 回调函数进行处理

```js
function getFile(filePath) {
    // resolve 是“成功的”回调函数；reject 是“失败的”回调函数
    return new Promise(function(resolve, reject)) {
        fs.readFile(filePath, 'utf8', (err, dataStr) => {
            if(err) return reject(err) // 如果读取文件失败，则调用“失败的”回调函数，并传入错误对象`err`
            resolve(dataStr) // 如果读取成功，则调用“成功的”回调函数，并传入成功的结果`dataStr`
        })
    }
}
// getFile 方法的调用过程
getFile('./files/1.txt').then(resolveHandler, rejectHandler)

```

- 如果读取文件失败，则调用 .then 中指定的“失败的”回调函数，并传入错误对象`err`
- 如果读取成功，则调用 .then 中指定的“成功的”回调函数，并传入`dataStr`
- [`fs.readFile(filePath, 'utf8', (err, dataStr) => {})`](https://note.youdao.com/)

> `promise-getFile.js`

```js
import fs from 'fs'

export function getFile(filePath) {
  // 当一个Promise被创建时，回调被立即执行
  return new Promise(function (resolve, reject) {
      fs.readFile(filePath, 'utf8', function (err, dataStr) {
        if (err) return reject(err);
        resolve(dataStr)
      })
    }
  )
}

```

> `promise-then-getFile.js`

```js
import { getFile } from './promise-getFile.js'

getFile('./files/1.txt').then(
  (r1) => { console.log(r1); },
  (err) => { console.log(err.message); }
)

getFile('./files/1.txt').then(
  (r1) => { console.log(r1); }
).catch(err => { console.log(err.message); })

```

- 运行`node promise/promise-getFile.js`

---

## 总结常用返回 promise 对象的方法<a href="#catalogue"> ⇧ </a>

### 返回promise对象的方法

- `axios`
- `fs.readFile` (`Node.js`)

### 不返回 promise 对象的异步方法

- `setTimeout/setInterval`
- `addEventListener`

---

## 试题<a href="#catalogue"> ⇧ </a>

> Promise 是什么

- 用于表示一个异步操作的最终完成或失败及其结果值

> `Promise.all(iterable)` 怎么运作的？

- `Promise.all()`方法传入**一个 Promise 的 iterable 类型(Array、Map、Set)**，返回**一个Promise实例**
- 这个 Promise 的 resolve 回调是在输入的**所有** Promise 的 resolve 回调都结束
- 只要**任何一个**输入的 Promise 的 reject 回调执行，立即抛出错误

```js
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});

Promise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values);
});
//  output: Array [3, 42, "foo"]

```

> `Promise.reject(1).then(console.log('then1')).catch(console.log('catch1')).then(console.log('then2')).catch(console.log('catch2'))` 运行到哪一步和运行结果

- `catch`方法返回一个 Promise 实例对象，并且处理拒绝的情况，它的行为和 then 是相同的

```js
let p = Promise.reject(1).then(console.log('then1')).catch(console.log('catch1')).then(console.log('then2')).catch(console.log('catch2'))
console.log(p)
setTimeout(() => {
  console.log(p);
})

//输出
then1
catch1
then2
catch2
Promise { <pending> }
  (node:54428) UnhandledPromiseRejectionWarning: 1
  Promise { <rejected> 1 }

```

1. `reject(1)`方法，返回一个状态为失败的Promise对象
2. 返回失败状态的 Promise 调用`.then(console.log('then1'))`方法，但是其中没有这种状态的回调函数，所以创建并返回一个和原始 Promise 失败状态相同的 Promise 实例对象
3. `catch(console.log('catch1'))`，调用`catch`方法，但是其中没有这种状态的回调函数，所以返回一个失败状态的Promise，输出`catch1`
4. catch 和 then本质上区别不大，最后都会返回一个新的 Promise对象
5. Promise 状态变成 fulfilled 或者 rejected 后不可以改变状态

---

<!-- Article End -->

<div style="text-align:center;">·未完待续·</div>

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
