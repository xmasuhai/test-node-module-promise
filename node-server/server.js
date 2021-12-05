// 加载 node 模块 node.js 16
/*
const http = require('http') // 创建服务器
const fs = require('fs') // 文件读取模块
const url = require('url') // url解析模块 将url字符串解析成一个对象
 */
// 转换为ES6模块
import http from 'http' // 创建服务器
import fs from 'fs' // 文件读取模块
import * as path from 'path'

const __dirname = path.resolve(path.dirname(''))

const server = http.createServer((req /*请求对象*/, res /*响应对象*/) => {
  let pathObj = new URL(`${req.url}`, 'http://localhost:8080/')
  // console.log(pathObj)
  // console.log(pathObj.searchParams.get('city'))
  if (pathObj.pathname === '/getWeather') {
    pathObj.searchParams.get('city') === 'beijing'
      ? res.end(JSON.stringify({city: '北京', weather: '晴天'}))
      : res.end(JSON.stringify({city: pathObj.searchParams.get('city'), weather: '未知'}))
  } else {
    try {
      // 默认为index.html
      let pathname = pathObj.pathname === '/' ? '/index.html' : pathObj.pathname
      // 读取非index.html文件的内容
      res.end(fs.readFileSync(__dirname + pathname))
    } catch (e) {
      res.writeHead(404, 'Note Found')
      res.end('<h1>404 Page Not Found</h1>')
    }

  }

}).listen(8080, () => {
  console.log('点击打开： http://localhost:8080/index.html')
}) // 监听端口
