import fs from 'fs'

export function getFile(filePath) {
  // 当一个Promise被创建时，回调被立即执行
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, 'utf8', function (err, dataStr) {
      if (err) return reject(err)
      resolve(dataStr)
    })
    }
  )
}
