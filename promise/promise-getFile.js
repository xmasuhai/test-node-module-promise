import fs from 'fs'

export function getFile(filePath) {
  return new Promise(
    // 当一个Promise被创建时，回调被立即执行
    function () {
      fs.readFile(
        filePath,
        'utf8',
        function (err, dataStr) {
        })
    }
  )
}