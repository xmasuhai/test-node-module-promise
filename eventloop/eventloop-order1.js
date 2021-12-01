import thenFs from 'then-fs'

console.log('A')
thenFs.readFile('./files/1.txt', 'utf8').then((dataStr) => {
  console.log('B')
})
setTimeout(() => {
  console.log('C')
}, 0)
console.log('D')

// ADCB
// sycn AD
// setTimeout 0 C
// readFile cost time then B