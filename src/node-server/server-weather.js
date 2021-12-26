// 运行 node node-server/server-weather.js
// 加载 node 模块
import http from 'http' // 创建服务器
import fs from 'fs' // 文件读取模块
import * as path from 'path'

const __dirname = path.resolve(path.dirname(''))

export const server = http.createServer((req /*请求对象*/, res /*响应对象*/) => {
  let urlObj = new URL(`${req.url}`, 'http://localhost:8080/')

  if (urlObj.pathname === '/getWeather') {
    res.end(JSON.stringify({data: '晴天'}))
  } else {
    res.end(fs.readFileSync(__dirname + '/index.html'))
  }

}).listen(8080, () => {
  console.log('点击打开： http://localhost:8080/index.html')
}) // 监听端口
