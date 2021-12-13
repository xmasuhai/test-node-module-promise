// 运行 node async_await/async-function.js
import thenFs from 'then-fs'

// 按顺序读取文件1、2、3的内容
export async function getAllFiles() {
  const r1 = await thenFs.readFile('./files/1.txt', 'utf8')
  console.log(r1)
  const r2 = await thenFs.readFile('./files/2.txt', 'utf8')
  console.log(r2)
  const r3 = await thenFs.readFile('./files/3.txt', 'utf8')
  console.log(r3)
}

getAllFiles()
