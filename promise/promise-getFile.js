export function getFile(filePath) {
  return new Promise(
    function () {
      fs.readFile(filePath, 'utf8', function (err, data) { })
    }
  )
}