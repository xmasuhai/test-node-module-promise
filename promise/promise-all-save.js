// 运行 node promise/promise-all-save.js
// Promise 是并发的，但如你一个一个地等待它们，会太费时间，Promise.all()可以节省很多时间
import { promisify } from 'util';
const sleep = promisify(setTimeout);

async function f1() {
  await sleep(1000);
}

async function f2() {
  await sleep(2000);
}

async function f3() {
  await sleep(3000);
}

(async () => {
  console.time('sequential separate');
  await f1();
  await f2();
  await f3();
  console.timeEnd('sequential separate');
})();

(async () => {
  console.time('concurrent promise.all');
  await Promise.all([f1(), f2(), f3()]);
  console.timeEnd('concurrent promise.all');
})();
