// https://github.com/rxaviers/async-pool/blob/master/lib/es6.js

// 模拟请求函数
const fakeRequest = (i) => {
  console.log('开始', i)
  return new Promise((resolve) => {
    return setTimeout(() => {
      resolve(i) // 传递参数给后一个处理 .then() 方法
      console.log('结束', i)
      console.log('---------------------')
    }, 1000 + Math.random() * 1000)
  })
}

// 伪造URL 接口数组
const urlList = Array(30).fill(0).map((value, index) => index)

/*
* 异步并发请求池
* @param {number} limit
* @param {Array<number>} urlArr
* @param {Function} iteratorFn
* @returns {Promise} Promise object represents the result of Promise.all
* */
async function asyncPool(limit, urlArr, iteratorFn) {
  // 存放所有 Promise
  const ret = []
  // 状态未变化，即仍然为pending的请求队列
  const executing = []

  for (const item of urlArr) {
    const p = iteratorFn(item)
    ret.push(p)

    // 请求并发限制数 小于 请求数量
    if (limit < urlArr.length) {
      const eItem = p.then(() => {
        console.log('正在运行', executing.length)
        // 如果模拟的请求结束 就从数组中剔除
        executing.splice(executing.indexOf(eItem), 1)
      })
      executing.push(eItem) // 先于 以上的微任务 .then() 方法执行

      // 当数组满了 就开始等 任意一项模拟请求结束
      if (executing.length >= limit) {
        // 必须等到最快的一项 模拟请求结束 才能进行下一轮 for 循环
        await Promise.race(executing)
      }
    }
  }

  // 等待返回最终所有结果
  return Promise.all(ret)
}

// 运行异步并发请求池
(async () => {
  const res = await asyncPool(3, urlList, fakeRequest)
  console.log('result', res)
})()
