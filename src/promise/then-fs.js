// 运行 node src/promise/then-fs.js
import thenFs from 'then-fs'

thenFs.readFile('./files/1.txt', 'utf8')
  .then(rt1 => console.log(rt1), err1 => console.log(err1))

thenFs.readFile('./files/2.txt', 'utf8')
  .then(rt2 => console.log(rt2), err2 => console.log(err2))

thenFs.readFile('./files/3.txt', 'utf8')
  .then(rt3 => console.log(rt3), err3 => console.log(err3))