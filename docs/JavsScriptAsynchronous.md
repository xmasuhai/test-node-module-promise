# 期约Promise、语法糖async和await

- [代码仓库 test-node-module-promise](https://github.com/xmasuhai/test-node-module-promise)

---

> 大纲链接<a id="catalogue" href="#catalogue" > § </a>

[toc]

---

## 回调地狱 <a href="#catalogue"> ⇧ </a>

### 避免回调地狱的原因 <a href="#catalogue"> ⇧ </a>

- 多层回调函数的相互嵌套，就形成回调地狱

```js
setTimeout(() => {
  console.log('延时1秒后输出')
  setTimeout(() => {
    console.log('延时2秒后输出')
    setTimeout(() => {
      console.log('延时3秒后输出')
    }, 3000)
  }, 2000)
}, 1000)

getCityFromIp(ip, (city) => {
  getWeatherFromCity(city, (weather) => {
    getSuggestionFromWeather(weather, suggestion => {
    ...
    })
  })
})
```

- 层层嵌套，难以维护
- 冗余代码相互嵌套，可读性差
- 错误处理更复杂

---

> ES6中使用 Promise 解决回调地狱

- 将层层嵌套变为`.then()`链式调用，减少缩进
- 使用写同步的方式写异步
- 易于错误处理

```js
f1(a)
        .then(b => f2(b), onerror1)
        .then(c => f3(c), onerror2)
        .catch(err => {})
```

---

## `Promise`的基本概念<a href="#catalogue"> ⇧ </a>

- `Promise` 是一个特殊的**对象类型**，用来**处理异步操作**，确切地说是***封装一个异步操作并获取结果***
- `Promise` 是一个构造函数，`new Promise()`返回一个 promise 实例对象
  - 创建`Promise`实例：`const promise = new Promise(executor);`
  - 这个执行函数`executor`代表**异步操作**
  - 参数`executor`的类型为函数
  - `executor`也有两个类型为函数的参数 `function(resolve, reject) {//写异步函数}`
    - `resolve` 成功时的回调，并返回成功的结果
    - `reject` 失败时的回调，并返回失败信息
  - 参数`executor`是自动调用，但必须在内部手动调用`resolve()` / `reject()`
- promise 实例对象创建与使用过程
  - `new Promise((resolveCb, rejectCb)=>{//写异步函数})` 返回一个`pendding`状态的 promise 实例对象
  - 预先声明的形参`resolveCb`、`rejectCb`
    - 如果将来成功，调用`resolveCb()`
    - 如果将来失败，调用`rejectCb()`

```js
// 1. 新建一个promise对象
// 2. promise 接收一个回调函数 这个函数被称为执行器函数 里面执行异步任务
// 3. 执行器函数接收两个参数 resolved rejected 两个参数都为函数类型
// 4. 异步操作执行成功了 执行resolved(value),失败了执行rejected(reason)
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

- promise对象内部运行变化
- 当`new Promise()`被实例化后，即表示 Promise 进入 pending 初始化状态，准备就绪，等待后续调用方法
- 一旦 promise 实例运行成功或者失败之后，实例状态就会变为 fulfilled 或者 rejected，此时状态就无法变更
- 内部主要就是状态的变化，在状态为 pending 时，会等待执行，一旦非 pending 态，就会运行存放在相应队列数组中的函数

> 处理非异步情况：

```js
var p = new Promise(function (resolve, reject) {
  resolve('Promise');
})
p.then((result) => {
  console.log(1)
})
p.then((result) => {
  console.log(2)
});

```

- 先实例化 Promise，同时执行完执行器函数（同步），状态由 pending 变为 fullilled，Promise 实例回调函数执行完成
- 此时并不会将 then 回调函数保存，函数顺序执行
- 继续执行，保存 then 回调，发现 Promise 状态已经变为 fullilled，then 的成功回调直接运行
- 以上代码的两个then回调都是这样

> 处理异步情况：

```js
var p = new Promise(function (resolve, reject) {
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
- 由于是 setTimeout 函数，回调函数进入任务队列，状态依然还是 pending
- Promise 实例回调函数执行完成，继续执行其他同步函数
- 此时并不会将then回调函数保存
- 继续执行，保存then回调，发现 Promise 状态还是 pending
- then 回调被保存在数组中，then回调保存完毕
- 执行setTimeout回调函数，执行被保存在数组中的then回调

> 提示：then/catch 都是一个 Promise

### 使用Promise的一般写法<a href="#catalogue"> ⇧ </a>

```js
function fn(arg) {
    return new Promise(fucntion(resolve, reject) {
        if(成功的条件) {
            resolve(data)
        } else {
            reject(reason)
        }
    })
}

fn(arg)
    .then(function(data) {
        console.log(data)
    })
    .catch(function(reason) {
        console.log(reason)
    })
```

---

> 使用Promise前：

```js
const getWeather = (city, onOk, onFail) => {
    const xhr = new XMLHttpRequest()
    let url = `http://rap2api.taobao.org/app/mock/244238/weather?city=${city}`
    xhr.open('GET', url, true)
    xhr.onload = () => onOk(JSON.parse(xhr.responseText))
    xhr.onerror = () => onFail
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

> 使用Promise后：

```js
const getWeather = city => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        // let url = `http://rap2api.taobao.org/app/mock/244238/weather?city=${city}`
        let url = `http://rap2.taobao.org:38080/app/mock/245421/getWeather?city=${city}`
        xhr.open('GET', url, true)
        xhr.onload = () => resolve(JSON.parse(xhr.responseText))
        xhr.onerror = () => reject('接口异常')
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
        : reject('接口数据异常');
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
        : reject('天气接口异常');
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

### `Promise`的状态<a href="#catalogue"> ⇧ </a>

> 一个 Promise 可以有多种状态：

- 进行中（Pending ） - 响应还没有就绪。请等待
- 已完成（Fulfilled） - 响应已完成。成功。请获取数据
- 已拒绝（Rejected） - 出现了一个错误。请处理它

> 当在**进行中**的状态时，不可以做任何事，仅仅是等待

- 其他状态中，可以增加处理函数，当一个 Promise 进入 Fulfilled 或 Rejected 状态时将调用这些函数
- `new Promise(function (resolveCb, rejectCb) {})`指定了
  - 进入 Fulfilled 状态时将调用的函数 `resolveCb`
  - 进入 Rejected 状态时将调用的函数 `rejectCb`

> 状态转换只有两种

- `pendding -> resolved`
- `pendding -> rejected`

> 一个 promise 对象的状态只能改变一次状态

- 无法取消，无法回退

> 一般地，成功后结果数据为`value` 失败后结果为`reason`

---

> 为了处理这个成功/失败接收的数据，需要一个 then 函数

### `.then()`

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
- 为了有效处理返回的数据（data），需要增加 then 和 catch 的处理函数，以便成功或失败的时候可以被调用

> then 和 catch 函数可以被连续的调用。在这个例子中，同时关注成功（success）和失败（failure）

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
  - `p.then(成功的好屌函数, 失败的回调函数)`
  - `p.then(result => {}, error => {})`
  - 调用`.then()`方法时，成功的回调函数是必选的，失败的回调函数是可选的

---

> 一个抛硬币的示例

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

> 一个异步操作在另一个异步操作之后执行的场景，需要处理 Promise chain 期约链

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

### `Promise` 实例中参数的调用机制<a href="#catalogue"> ⇧ </a>

> `new Promise((resolve, reject) => {})` 中的 resolve 和 reject 方法，在异步代码中调用

- 由于JS是单线程，会优先在主线程执行同步代码
- 异步代码会放到任务队列中
- 所以在刚运行时，Promise实例为pending(进行中)状态
- 等待主线程执行完毕，任务队列通知主线程，异步任务可以执行了，该任务才会进入主线程执行
- 此时setTimeout中的回调函数被调用，执行了resolve() 或 reject() 方法
- Promise实例会随之改变状态,并存储传入的数据

> resolve()、 reject() 方法，不可重复调用

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
- 精确地控制读取结果的顺序，需要进一步优化

### 方式三：基于`Promise`链式调用按顺序读取文件的内容<a href="#catalogue"> ⇧ </a>

> `.then()`方法的特性

- 如果上一个`.then()`中返回了一个新的`Promise`实例对象，则可以通过下一个`.then()`继续进行处理
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

#### 通过`.catch`方法捕获错误<a href="#catalogue"> ⇧ </a>

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

> 如果不希望前面的错误导致后续的 .then() 无法执行，则可以将 .catch 的调用提前到第一个异步操作后

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

> 总结

- `.then` 的第二个参数，即接收错误处理的回调`rejectCb`，只能处理**它之前的`promise`的`reject`**
- `.catch` 可以处理之前 `Promise` 链上所有的错误，包括 在 `.then()` 中的 `resolve` 成功回调函数中的错误

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

#### `Promise.all()`<a href="#catalogue"> ⇧ </a>

##### `Promise.all()` 基本语法<a href="#catalogue"> ⇧ </a>

```js
const p = Promise.all([p1, p2, p3]);
```

- 返回一个**新的 promise 对象**
- `Promise.all()`方法接受一个数组作为参数，一般地 p1、p2、p3 都是 Promise 实例
  -  p1、p2、p3 **互相独立，参数之间不能相互依赖**
  - 如果不是，会自动先调用下`Promise.resolve`方法，将参数转为 Promise 实例，再进一步处理
- `Promise.all()`方法的参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是 Promise 实例
- p 的状态由`p1、p2、p3`决定，分成两种情况
  - 1）只有`p1、p2、p3`的状态都变成`fulfilled`，p 的状态才会变成`fulfilled`，此时p1、p2、p3 的返回值组成一个数组，传递给 p 的回调函数。
  - 2）只要`p1、p2、p3`之中有一个被`rejected`，p 的状态就变成`rejected`，此时**第一个被reject的实例**的返回值，会传递给 p 的回调函数
- 相较于 .then() 方法的链式操作，Promise.all()  更注重并发，即依次按顺序发送多个请求，等待所有的请求均有结果之后，对应请求按顺序将数据依次存放到数组中返回

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

- Promise.all() 参数数组中 Promise 实例的顺序，就是最终结果的顺序
- Promise.all 本身也是异步操作
- 多个 Promise.all 运行看哪个先被执行，就先打印哪个

##### `Promise.all()` 的 `Pollyfill`<a href="#catalogue"> ⇧ </a>

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
- 列表中每项都是一个 `pendding` 状态的 `Promise`，而不是数据

> 使用`Promise.all(Array<Promise>)` 接收promise对象数组，并返回一个单独的promise对象

- 当`Promise.all`中所有的promise对象都变为`fullfilled`时，`Promise.all`返回的promise对象的状态才变为`fulfilled`
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

---

#### `Promise.race()`<a href="#catalogue"> ⇧ </a>

##### `Promise.race()`基本语法<a href="#catalogue"> ⇧ </a>

```js
const p = Promise.race([p1, p2, p3]);
```

- 只要`p1、p2、p3`之中有一个实例率先改变状态，p 的状态就跟着改变
- 率先改变的 Promise 实例的返回值，就传递给 p 的回调函数

---

##### `Promise.race()`示例<a href="#catalogue"> ⇧ </a>

> `Promise.race()`也会发起并行的 Promise 异步操作
>
> 只要**任意一个异步操作结束后**就立即执行下一步的 .then() 操作
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

##### `Promise.race` 的 `Pollyfill`<a href="#catalogue"> ⇧ </a>

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

---

#### `Promise.allSettled()`<a href="#catalogue"> ⇧ </a>

##### `Promise.allSettled()`基本语法<a href="#catalogue"> ⇧ </a>

```js
const p = Promise.allSettled([p1, p2, p3]);
```

- 无论哪一个Promise实例是成功还是失败，都会将结果依次按请求顺序放到数组中

---

#### `Promise.any()`<a href="#catalogue"> ⇧ </a>

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

### 创建具体的异步操作<a href="#catalogue"> ⇧ </a>

> 创建具体的异步操作，需要在 `new Promise()` 构造函数期间，传递一个 `funxtion` 函数作为参数
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

> 仍然是三个步骤，但每一个步骤都需要之前每个步骤的结果
>
> Pomise的实现看着很晕，传递参数太过麻烦

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

### 无法替代的场景

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


---

## 在`Fetch API`和`Axios`中的应用<a href="#catalogue"> ⇧ </a>

---

## 总结常用返回promise对象的方法<a href="#catalogue"> ⇧ </a>

### 返回promise对象的方法

- `axios`
- `fs.readFile` from `Node.js`

### 不返回promise对象的异步方法

- `setTimeout/setInterval`
- `addEventListener`

---

## 试题<a href="#catalogue"> ⇧ </a>

> Promise是什么

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
