# 手写服务器、数据Mock、前后端联调

- [代码仓库 test-node-module-promise](https://github.com/xmasuhai/test-node-module-promise)

---

## 大纲链接<a id="catalogue" href="#catalogue" > § </a>

[toc]

---

> 前端在开发中如何mock数据

- 涉及与后端交互，发送Ajax请求，从后台获取数据/向后端提交数据
- 前端按照接口文档模拟接口数据，实现前后端同步开发
- 模拟的数据和后端真实数据**遵循同样的格式**，内容无关紧要
- 通过模拟数据的字段，将数据展示到页面中
- 当后端完成接口后，通过联调，替换真实接口

> 准备

- 安装`node14+` 或者安装`node16`

## 1. Node.js手写服务器Mock数据 <a href="#catalogue"> ⇧ </a>

### 1.1 使用node.js手写server

> 20行代码实现server：`server.js`

```js
// 加载 node 模块
const http = require('http') // 创建服务器
const fs = require('fs') // 文件读取模块
const url = require('url') // url解析模块

const server = http.createServer((req, res) => {

}).listen(8080) // 监听端口

console.log('open http://localhost:8080'); // 运行`node server.js` ，打开地址，浏览器一直处于等待响应的状态

```

- 命令行运行`node server.js`
- 实现模拟后端
- 前端发送请求至模拟后端服务器，给出对应的响应
- 调用`http.createServer(()=>{}).listen(8080)`创建server
- 监听8080端口
- 服务器是一个运行在机器上的软件，监听一些端口
- 当端口监听到到请求时，接收请求并发出响应
- 服务器时刻等待请求，做出响应的一个运行中的软件

> `server.js`

```js
// 加载 node 模块
const http = require('http') // 创建服务器
const fs = require('fs') // 文件读取模块
const url = require('url') // url解析模块

const server = http.createServer((req /*请求对象*/, res /*响应对象*/) => {
  res.end('hello server')
}).listen(8080) // 运行时一直监听8080端口

console.log('open http://localhost:8080');
```

- 运行时一直监听8080端口
- 当浏览器输入地址`http://localhost:8080`时，请求到服务器上
- 请求对象`req`，请求相关信息
- 响应对象`res`：要发送响应的对象
- `res.end('hello server')` 发送响应给浏览器

### 1.2 打印`urlObj` url字符串解析对象

```js
// 加载 node 模块
const http = require('http') // 创建服务器
const fs = require('fs') // 文件读取模块
const url = require('url') // url解析模块 将url字符串解析成一个对象

const server = http.createServer((req /*请求对象*/, res /*响应对象*/) => {
  let urlObj = url.parse(req.url)
  console.log(urlObj);
  res.end('hello server')
}).listen(8080) // 监听端口


console.log('open http://localhost:8080');

```

- `const url = require('url')`：解析`url`解析模块
- `url.parse(req.url)`将url字符串解析成一个对象
- 运行`node server.js`可以看到以下内容：

```js
Url {
  protocol: null,
  slashes: null,
  auth: null,
  host: null,
  port: null,
  hostname: null,
  hash: null,
  search: null,
  query: null,
  pathname: '/',
  path: '/',
  href: '/'
}
// 浏览器默认自动发送请求
Url {
  protocol: null,
  slashes: null,
  auth: null,
  host: null,
  port: null,
  hostname: null,
  hash: null,
  search: null,
  query: null,
  pathname: '/favicon.ico',
  path: '/favicon.ico',
  href: '/favicon.ico'
}
```

- 在地址栏添加输入任意字符`http://localhost:8080/aabbcc`后查看可打印以下内容：

```js
Url {
  protocol: null,     
  slashes: null,      
  auth: null,
  host: null,
  port: null,
  hostname: null,     
  hash: null,
  search: null,       
  query: null,        
  pathname: '/aabbcc',
  path: '/aabbcc',    
  href: '/aabbcc'     
}
```

- 在地址栏添加输入任意字符`http://localhost:8080/123/abc.html`后查看可打印以下内容：

```js
Url {
  protocol: null,
  slashes: null,
  auth: null,
  host: null,
  port: null,
  hostname: null,
  hash: null,
  search: null,
  query: null,
  pathname: '/123/abc.html',
  path: '/123/abc.html',
  href: '/123/abc.html'
}
```

- `pathname: '/123/abc.html'`
- `pathObj.pathname`请求路径参数：指`http://localhost:8080/xxx`斜杠后的内容（包括斜杠）
- 也可以包括**查询参数**`http://localhost:8080/123/abc.html?a=1&b=2`

```js
Url {
  protocol: null,
  slashes: null,
  auth: null,
  host: null,
  port: null,
  hostname: null,
  hash: null,
  search: '?a=1&b=2',
  query: 'a=1&b=2',
  pathname: '/123/abc.html',
  path: '/123/abc.html?a=1&b=2',
  href: '/123/abc.html?a=1&b=2'
}
```

### 1.3 写一个简单地HTML `index.html` 模拟页面发起请求

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Server</title>
</head>
<body>
<p>天气： <span></span></p>
<script>
  const xhr = new XMLHttpRequest()
  xhr.open(
    'GET',
    'http://localhost:8080/getWeather',
    true
  )
  xhr.onload = () => {
    document.querySelector('span').innerText = JSON.parse(xhr.responseText).data
  }
  xhr.send()
</script>
</body>
</html>

```

> `server.js`

```js
// 加载 node 模块
const http = require('http') // 创建服务器
const fs = require('fs') // 文件读取模块
const url = require('url') // url解析模块 将url字符串解析成一个对象

const server = http.createServer((req /*请求对象*/, res /*响应对象*/) => {
  let urlObj = url.parse(req.url)

  // 读取文件
  res.end(fs.readFileSync(__dirname + '/index.html'))

}).listen(8080) // 监听端口

console.log('open http://localhost:8080/index.html')

```

- 读取文件`fs.readFileSync(__dirname + '/...')`
  - 其中`fs.readFileSync()`方法表示读取
  - `__dirname`表示当前路径
    - 如果在`package.json`中设置了`"type": "module",`的话，注意`There is no __dirname when using ESM modules`
    - 添加`import * as path from 'path'`和`const __dirname = path.resolve(path.dirname(''));`
  - 读取`index.html`：`res.end(fs.readFileSync(__dirname + '/index.html'))`
- `url.parse(req.url)`在`node.js 15+`后弃用，改为```let urlObj = new URL(`${req.url}`, 'http://localhost:8080/')```
- 运行`node server.js`
- 在地址栏输入`http://localhost:8080/index.html`查看network面板

### 1.4 改为使用ES6模块

```js
// 加载 node 模块
/*
const http = require('http') // 创建服务器
const fs = require('fs') // 文件读取模块
const url = require('url') // url解析模块 将url字符串解析成一个对象
 */
// 转换为ES6模块
import http from 'http' // 创建服务器
import fs from 'fs' // 文件读取模块
import * as path from 'path'

const __dirname = path.resolve(path.dirname(''));

const server = http.createServer((req /*请求对象*/, res /*响应对象*/) => {
  let urlObj = new URL(`${req.url}`, 'http://localhost:8080/')
  // There is no __dirname when using ESM modules
  res.end(fs.readFileSync(__dirname + '/index.html'))

}).listen(8080, () => {
  console.log('点击打开： http://localhost:8080/index.html')
}) // 监听端口

```

- 读取了`index.html`并展示到浏览器中，现在的`server.js`启动服务展示了`index.html`页面
- 模拟Ajax请求
- `res.end(JSON.stringify())`发出响应，传输字符串

```js
// 加载 node 模块
import http from 'http' // 创建服务器
import fs from 'fs' // 文件读取模块
import * as path from 'path'

const __dirname = path.resolve(path.dirname(''))

const server = http.createServer((req /*请求对象*/, res /*响应对象*/) => {
  let urlObj = new URL(`${req.url}`, 'http://localhost:8080/')

  if (urlObj.pathname === '/getWeather') {
    res.end(JSON.stringify({data: '晴天'}))
  } else {
    res.end(fs.readFileSync(__dirname + '/index.html'))
  }

}).listen(8080, () => {
  console.log('点击打开： http://localhost:8080/index.html')
}) // 监听端口

```

- 浏览器打开`http://localhost:8080/index.html`，向服务器发送请求，请求的`urlObj.pathname`为`/`，代表当前主页
- 此时`urlObj.pathname`为`/`，返回读取当前路径下的`index.html`文件
  - 获取文件的绝对路径`__dirname + '/index.html'`
  - 读取文件内容`fs.readFileSync(__dirname + '/index.html')`
  - 发送响应`res.end(fs.readFileSync(__dirname + '/index.html'))`，即发送首页内容
- 浏览器解析首页，执行`script`标签中的JS代码
  - JS发送Ajax请求`xhr.open('GET', 'http://localhost:8080/getWeather', true)`到服务器`server.js`
- 此时`urlObj.pathname`为`/getWeather`，返回数据`{data: '晴天'}`

> 小结

- 此时的服务器`server.js`既能够支持当前`index.html`的页面展示，也能支持当前需要用到的接口

### 1.5 功能完善

> `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Server</title>
</head>
<body>
<p>天气： <span></span></p>
<script>
  const xhr = new XMLHttpRequest()
  xhr.open(
    'GET',
    'http://localhost:8080/getWeather?city=beijing',
    true
  )
  xhr.onload = () => {
    document.querySelector('span').innerText = JSON.parse(xhr.responseText).city + JSON.parse(xhr.responseText).weather
  }
  xhr.send()
</script>
</body>
</html>

```

> `node-server/server.js`

```js
// 加载 node 模块
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

```

- 运行`node node-server/server.js`
- 默认首页`/`，判断请求路径是否为`/index.html`
- 注意关闭上一个`server.js`，避免已使用端口`address already in use :::8080`
- 如果路径不为`/`或`/index.html`，就读取路径下的文件`res.end(fs.readFileSync(__dirname + pathname))`
- 如果读取文件失败，就走`catch`逻辑
- 服务器端告诉浏览器的状态码与提示文字：`res.writeHead(404, 'Note Found')`
- `pathObj.searchParams.get('city') === 'beijing'`：返回一个Map类型的数据，使用Map.prototype.get方法获取值

### 缺点

- 难以和后端沟通联调，统一接口文档

---

### 1.6 拓展：高级用法，手写Express

> 从实现简易Server到实现node后端框架Express.js

- https://github.com/jirengu/node-server

---

## 1.2 Mock.js 和 Mock 平台介绍和用法

> 安装引入mock.js，在本地模拟数据

- [mockjs文档示例](http://mockjs.com/examples.html)
- [安装使用mockjs](https://github.com/nuysoft/Mock/wiki/Getting-Started)

### 2. Mock.js用法 <a href="#catalogue"> ⇧ </a>

> 预先定义好数据范例格式，随机生成数据

- 比如[淘宝 Rap2 平台](http://rap2.taobao.org/)的mock格式

---

## 3. 阿里Rap2 Mock平台的使用 <a href="#catalogue"> ⇧ </a>

> [淘宝 Rap2 平台](http://rap2.taobao.org/)

- 使用不同模块来区分不同类型的功能，比如登录、注册、订单、地址管理模块等
- 新建**仓库**->参考示例模块->新建**模块**->新建**接口**
- 所有新建名称一般为英文，可添加中文描述

### 编辑接口，添加响应

- 编写相应内容：
  - 名称
  - 类型
  - 初始值
  - 简介
- 保存


---

> 沟通确定接口文档

## 4. 前后端接口规范 <a href="#catalogue"> ⇧ </a>

- [后端接口规范（范例） by 饥人谷](https://www.yuque.com/docs/share/08fd7cfb-6716-4409-9b15-fd9e9d491f34)
- [md文件](http://note.youdao.com/noteshare?id=d4c1e403217ce45bc3d257c6962604cb&sub=FE10B9AECB87478195A434663AEE265F)


---

## 5. 使用curl命令行测试已经运行的后端接口 <a href="#catalogue"> ⇧ </a>



---

>

---

<!-- Article End -->

<div style="text-align:center;">·未完待续·</div>

---

#### 参考文章

- [Node.js v16.13.1 documentation](https://nodejs.org/dist/latest-v16.x/docs/api/)
- [Mock数据.pdf](https://static.xiedaimala.com/xdml/file/f40ceb64-df08-4420-9226-7f76dbff15d5/2020-2-22-15-51-5.pdf)

#### 相关文章

- 无

---

- 作者： Joel
- 文章链接：
- [版权声明](http://xmasuhai.xyz/posts/版权声明链接/)
- 非自由转载-非商用-非衍生-保持署名
- <a style='color:#DB2D5D;' href='https://xiedaimala.com/bbs/users/8c266e6f-55a2-4348-a180-17cb8cdb2c46#/?page=1' target='_blank' rel='noreferrer noopener'>河</a>
  <a style='color:#006CFF;' href='https://juejin.im/user/59abfad26fb9a0248f4aa221' target='_blank' rel='noreferrer noopener'>掘</a>
  <a style='color:#009A61;' href='https://segmentfault.com/u/joel_59b17eb9d2155' target='_blank' rel='noreferrer noopener'>思</a>
  <a style='color:#0084FF;' href='https://www.zhihu.com/people/xue-shou-41/posts' target='_blank' rel='noreferrer noopener'>知</a>
  <a style='color:#EA6F5A;' href='https://www.jianshu.com/u/079916729823' target='_blank' rel='noreferrer noopener'>简</a>

---
---
