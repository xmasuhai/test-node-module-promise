// 运行 node eventloop/eventloop-order5.js
// setTimeoutA
setTimeout(() => {
  console.log(1)
}, 0)

const p = new Promise((resolve) => {
  console.log(2)
  // setTimeoutB
  setTimeout(() => {
    // setTimeoutB 宏任务完成之后 锁定 promise 对象状态为成功
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
    - setTimeoutA 0ms
    - setTimeoutB 0ms
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
