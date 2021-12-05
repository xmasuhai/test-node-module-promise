// 加载 node 模块
const http = require('http') // 创建服务器
const fs = require('fs') // 文件读取模块
const url = require('url') // url解析模块 将url字符串解析成一个对象

const server = http.createServer((req /*请求对象*/, res /*响应对象*/) => {
  let urlObj = url.parse(req.url)

  // 读取文件
  res.end(fs.readFileSync(__dirname + '/index.html'))

}).listen(8080) // 监听端口
