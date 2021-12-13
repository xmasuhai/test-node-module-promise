// 运行 node async_await/async-async_step.js
import thenFs from 'then-fs'

console.log('sync step A');

export async function getAllFile() {
  console.log('sync step B');
  const r1 = await thenFs.readFile('./files/1.txt', 'utf8')
  const r2 = await thenFs.readFile('./files/2.txt', 'utf8')
  const r3 = await thenFs.readFile('./files/3.txt', 'utf8')
  console.log(r1, r2, r3);
  console.log('async step D');
}

getAllFile();
console.log('sync step C');
