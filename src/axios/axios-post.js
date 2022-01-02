// 运行 node src/axios/axios-post.js
import axios from 'axios'
// 直接发起
axios.post('/api/addbook',
  {
    bookname: '金瓶梅',
    author: '兰陵笑笑生',
    publisher: '上海图书出版社'
  },
  {
    baseURL: 'http://www.liulongbin.top:3006/',
    timeout: 1000
  }
).then(res => {
  const {data} = res
  console.log(data)
})
  .catch(err => {
    console.log(err)
  })
/* 不允许重复添加 */

// 先配置，后发起请求
const instance = axios.create({
  baseURL: 'http://www.liulongbin.top:3006/',
  timeout: 1000
})

instance.post('/api/addbook',
  {
    bookname: '三国演义',
    author: '罗贯中',
    publisher: '重庆图书出版社'
  })
  .then(
    (res) => {
      const {data, status} = res
      console.log('先配置，后发起不带参请求')
      console.log('data', data)
      console.log('status', status)
      console.log('-----------------')
    }
  )
  .catch(err => {
    console.log(err)
  })
