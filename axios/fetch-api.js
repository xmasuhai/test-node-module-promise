// 在Node环境中使用 Fetch API 安装 pnpm add node-fetch
// 运行 node axios/fetch-api.js
import fetch, {Headers} from 'node-fetch'

const myHeaders = new Headers()
myHeaders.append('User-Agent', 'apifox/1.0.0 (https://www.apifox.cn)')

const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
}

/*
fetch('http://www.liulongbin.top:3006/api/getbooks', requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error))
*/

const response = await fetch('http://www.liulongbin.top:3006/api/getbooks', requestOptions)
const {data} = await response.json()
console.log(data)

const response2 = await fetch('https://api.github.com/users/github', requestOptions)
const data2 = await response2.json()
console.log(data2)
