// 运行 node axios/axios-axios.js
import axios from 'axios'
// 默认Get 读取全部数据
axios('http://www.liulongbin.top:3006/api/getbooks')
  .then((res) => {
    const {data: dataObject} = res
    console.log('默认Get 读取全部数据')
    console.log('dataObject.data: ', dataObject.data)
    console.log('--------------')
  })
// 配置选项，读取全部数据
axios({
  method: 'GET',
  url: 'http://www.liulongbin.top:3006/api/getbooks'
})
  .then((res) => {
    const {data: dataObject} = res
    console.log('配置选项，读取全部数据')
    console.log('dataObject.data: ', dataObject.data)
    console.log('--------------')
  })
// 配置params选项，读取部分数据
axios({
  method: 'GET',
  url: 'http://www.liulongbin.top:3006/api/getbooks',
  params: {id: 2}
})
  .then((res) => {
    const {data: dataObject} = res
    console.log('配置params选项，读取部分数据')
    console.log('dataObject: ', dataObject)
    console.log('--------------')
  })
// 发起提交请求
axios({
  method: 'POST',
  url: 'http://www.liulongbin.top:3006/api/addbook',
  data: {
    bookname: '哈利波特',
    author: 'JK罗琳',
    publisher: '上海译文图书出版社'
  }
})
  .then((res) => {
    const {data: dataObject} = res
    console.log('发起提交请求')
    console.log('dataObject: ', dataObject)
    console.log('--------------')
  })
