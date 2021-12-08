const p1 = new Promise(function (resolve) {
  resolve('2') // 同步执行
})

// setTimeoutA
setTimeout(function () {
  console.log('1')
}, 10)

// thenA
p1
  .then(function (value) {
    console.log(value)
  })

// setTimeoutB
setTimeout(function () {
  console.log('3')
}, 0)

/*
- 同步
  -
- Web API
  - setTimeoutA 10ms
  - setTimeoutB 0ms // 先于 setTimeoutA 将回调添加到宏任务队列
- 异步
  - 微任务
    - thenA // console.log(value) // resolve('2') value 为同步执行的结果
      - console.log(2)
  - 宏任务
    - console.log('3')
    - console.log('1')
* */

/*
2
3
1
* */
