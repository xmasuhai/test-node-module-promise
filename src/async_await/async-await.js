// 运行 node async_await/async-await.js
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

/*
- await 需要等待**后面的 promise 实例是状态为成功**时，才会执行之后的代码
- 首先 当前上下文中，await 之后的代码都是**异步微任务** @aw
- 如果已经知道 await 后面的实例状态是成功的话
  - 则 @aw 直接放在 Event Queue 中，等待执行即可
- 如果 await 后面实例状态是失败的话
  - 则 @aw 在 Web API 中永远不会进入到 Event Queue 中，因为永远不会执行
- 如果暂时还不知道是成功还是失败，则 @aw 先放置在 Web API 中
  - 等到知道实例状态是成功后，再挪至到 Event Queue 中等待执行
* */