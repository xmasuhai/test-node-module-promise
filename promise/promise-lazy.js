import fs from 'fs'

// 当一个Promise被创建时，回调被立即执行
// 而使用工厂函数生成一个Promise对象，回调中的异步语句不会立即执行
export const lazyPromise = (filePath) => {
  return new Promise(() => {
    // thenFs.readFile or other async like HTTP request
    fs.readFile(
      filePath,
      'utf8',
      function (err, dataStr) {
      })
  })
}
