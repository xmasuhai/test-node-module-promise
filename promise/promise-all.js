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
