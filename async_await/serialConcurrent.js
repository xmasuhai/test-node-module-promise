// 运行 node async_await/serialConcurrent.js
const delay = (ms) => {
  return new Promise(resolve => { return setTimeout(resolve, ms)})
};

// 串行 async serial
;(async () => {
  const p1 = delay(2000)
  const p2 = delay(2000)
  console.time('delay_serial')
  await p1
  await p2
  console.timeEnd('delay_serial')
})();

// 并发 Promise.all
;(async () => {
  const p1 = delay(2000)
  const p2 = delay(2000)
  console.time('delay_concurrent')
  await Promise.all([p1, p2])
  console.timeEnd('delay_concurrent')
})();
// 显然两段代码的都 delay: 2000 ms
