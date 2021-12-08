console.log('script start')

// setTimeoutA
setTimeout(() => {
  console.log('time1')
}, 2000)

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

/*
// 重写代码顺序
// 将函数声明带入函数执行位置
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

* */

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