import thenFs from 'then-fs'

thenFs.readFile('./files/11.txt', 'utf8') // 文件不存在导致读取失败
  // 提前捕获第一个异步操作的错误，并输出错误信息
  .catch(err => {
    console.log(err.message);
  })
  // 之后 3个 .then 的链式操作都正常执行
  .then(rt1 => {
    console.log(rt1)
    return thenFs.readFile('./files/2.txt', 'utf8')
  })
  .then(rt2 => {
    console.log(rt2)
    return thenFs.readFile('./files/3.txt', 'utf8')
  })
  .then(rt3 => {
    console.log(rt3)
  })
