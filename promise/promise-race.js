import { promiseArrOK, promiseArrOKReversal, promiseArrErr, promiseArrFail } from './promise-arr.js'

// 以异步操作数组为参数
Promise.race(promiseArrOK)
  .then(result => { // 只要任何一个异步操作完成，就立即执行成功的回调函数
    console.log(result);
  })

Promise.race(promiseArrOKReversal)
  .then(result => {
    console.log(result);
  })

Promise.race(promiseArrErr)
  .then(result => {
    console.log(result);
  })
  .catch(err => {
    console.log(err.message);
  })

Promise.race(promiseArrFail)
  .then(result => {
    console.log(result);
  })
  .catch(err => {
    console.log(err.message);
  })

// fast
const fastPromise = new Promise((resolve/*, reject*/) => {
  setTimeout(() => resolve(`fast`), 100);
});

const slowPromise = new Promise((resolve/*, reject*/) => {
  setTimeout(() => resolve(`slow`), 200);
});

const arr = [fastPromise, slowPromise];

Promise.race(arr).then(console.log); // fast
