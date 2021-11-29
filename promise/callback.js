// 如果在`package.json`中设置了`"type": "module"`
// 删除或改为`"type": "commonjs"` 解除以下注释
// const fs = require('fs');
// 或者使用 webStorm 开启 node.js辅助 并导入 import fs from 'fs'

import fs from 'fs'
// 读取文件 1.txt
fs.readFile('./files/1.txt', 'utf8', (error1, result1) => {
  if (error1) return console.log(error1.message) // 读取文件 1.txt 失败
  console.log(result1) // 读取文件 1.txt 成功

  // 读取文件 2.txt
  fs.readFile('./files/2.txt', 'utf8', (error2, result2) => {
    if (error2) return console.log(error2.message) // 读取文件 2.txt 失败})
    console.log(result2) // 读取文件 2.txt 成功

    // 读取文件 3.txt
    fs.readFile('./files/3.txt', 'utf8', (error3, result3) => {
      if (error3) return console.log(error3.message) // 读取文件 3.txt 失败})
      console.log(result3) // 读取文件 3.txt 成功
    })

  })

})
