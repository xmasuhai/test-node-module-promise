// 运行 node promise/promise-object.js
// 1. 新建一个promise对象
// 2. promise 接收一个回调函数 这个函数被称为执行器函数 里面执行异步任务
// 3. 执行器函数接收两个参数 resolved rejected 两个参数都为函数类型
// 4. 异步操作执行成功了 执行resolved(value),失败了执行rejected(reason)
const p1 = new Promise((resolved, rejected) => {
  setTimeout(() => {
    // 模拟异步任务 如果当前时间为偶数就成功 否则就失败
    const time = Date.now()
    time % 2 === 0
      ? resolved(`执行成功 ${time}`)
      : rejected(`执行失败 ${time}`)
  }, 1000)
})

p1.then(
  // 接收成功的value数据 onResoled
  value => {
    console.log(`onResoled ${value}`)
  },
  // 接收失败的reason数据 onRejected
  reason => {
    console.log(`onRejected ${reason}`)
  }
)

// 处理非异步情况
const p2 = new Promise(function (resolve/*, reject*/) {
  console.log('sync')
  resolve('Promise')
})
p2.then((/*result*/) => {
  console.log(1)
})
p2.then((/*result*/) => {
  console.log(2)
})

// 处理异步情况
const p3 = new Promise(function (resolve/*, reject*/) {
  setTimeout(() => {
    console.log('setTimeout')
    resolve('Promise')
  }, 1000)
})
p3.then((/*result*/) => {
  console.log(1)
})
p3.then((/*result*/) => {
  console.log(2)
})
