// 运行 node src/promise/promise-then.js
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

/*
基于then返回的 promise 实例的状态和值，主要看 onfulfilled/onrejected 是否执行
- 函数返回的不是 promise 实例：
  - 方法执行不报错，p2 状态是 成功，值即返回值
  - 方法执行报错，则 p2 是失败的，值是报错原因
- 函数返回的是个 promise 实例：则这个实例的状态和值决定了 p2 的状态和值
*/

