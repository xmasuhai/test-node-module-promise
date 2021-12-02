console.log('1')
// setTimeout A
setTimeout(function() {
  console.log('2')
  new Promise(function(resolve) {
    console.log('3')
    resolve()
  })
    // then B
    .then(function() {
      console.log('4')
    })
}, 0)
new Promise(function(resolve) {
  console.log('5')
  resolve()
})
  // then A
  .then(function() {
    console.log('6')
  })
// setTimeout B
setTimeout(function() {
  console.log('7')
  new Promise(function(resolve) {
    console.log('8')
    resolve()
  })
    // then C
    .then(function() {
      console.log('9')
    })
}, 0)

/*
- 执行栈
  - console.log('1') // sync
  - console.log('5') // sync
  - console.log('6') // then A
  - console.log('2') // sync in setTimeout A
  - console.log('3') // sync in setTimeout A
  - console.log('4') // then B
  - console.log('7') // sync in setTimeout B
  - console.log('8') // sync in setTimeout B
  - console.log('9') // then C

- 微任务队列
  -[x] then A
  -[x] then B
  -[x] then C

- 宏任务队列
  -[x] setTimeout A
  -[x] setTimeout B

* */
