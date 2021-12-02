// macrotask
setTimeout(() => {console.log('4')})
// synchronous
new Promise(function (resolve) {
  console.log('1')
  resolve()
})
  // microtask
  .then(() => {console.log('3')})
// synchronous
console.log('2')
