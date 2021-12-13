// 运行 node promise/promise-resolve.js
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
    resolve(200)// 调用成功回调 resolve() 更新实例的状态和值
    // 之后的所有 .then 方法都为宏任务中的微任务
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
