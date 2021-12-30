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
