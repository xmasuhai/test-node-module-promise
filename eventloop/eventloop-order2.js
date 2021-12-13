// 运行 node eventloop/eventloop-order2.js
// declaration
async function async1() {
  console.log('async1 start')
  await async2()
  // microtask A
  console.log('async1 end')
}
async function async2() {
  console.log('async2')
}

// run code
console.log('script start')
// setTimeout A
setTimeout(function () {
  console.log('setTimeout')
}, 0)
// sync A
async1()
// sync B
new Promise(function (resolve) {
  console.log('promise1')
  resolve()
})
  // then A
  .then(function () {
    console.log('promise2')
  })
console.log('script end')


/*
- 执行栈
  - console.log('script start'); // sync code
  - console.log('async1 start'); // sync code in async1
  - console.log('async2'); // sync code in async2
  - console.log('promise1'); // sync code
  - console.log('script end'); // sync code
  - console.log('async1 end'); // microtask A in async1
  - console.log('promise2'); // then A
  - console.log('setTimeout'); // sync code in setTimeout A

- 微任务队列
  -[x] microtask A in async1
  -[x] then A

- 宏任务队列
  -[x] setTimeout A

* */
