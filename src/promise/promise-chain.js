// 运行 node src/promise/promise-chain.js
import thenFs from 'then-fs'

thenFs.readFile('./files/1.txt', 'utf8') // 1. 返回值是 Promise 的实例对象
  .then(rt1 => { // 2. 通过 .then 为第一个 Promise 实例指定充公之后的回调函数
    console.log(rt1)
    return thenFs.readFile('./files/2.txt', 'utf8') // 3. 在第一个 .then 中返回一个新的 Promise 实例对象
  })
  .then(rt2 => { // 4. 继续调用 .then 为上一个 .then 的返回值（新Promise实例）指定成功之后的回调函数
    console.log(rt2)
    return thenFs.readFile('./files/3.txt', 'utf8') // 5. 在第二个 .then 中再返回一个新的 Promise 实例对象
  })
  .then(rt3 => { // 6. 继续调用 .then 为上一个 .then 的返回值（新Promise实例）指定成功之后的回调函数
    console.log(rt3)
  })
