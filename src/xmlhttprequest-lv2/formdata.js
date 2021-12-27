// node 环境
// import {XMLHttpRequest} from 'xmlhttprequest-ts' // XMLHttpRequest level2
// import FormData from 'form-data' // 不能用原生 xhr 发送请求，使用实例自己的 API
// import {FormData} from "formdata-node" // 不能用原生 xhr 发送请求，使用实例自己的 API

// 新建 FormData 对象实例 fd
const fd = new FormData()
// 可多次为 FormData 添加表单项
fd.append('uname', 'zz')
fd.append('upwd', '123456')
// 创建 xhr 实例对象
const xhr = new XMLHttpRequest()
// 指定请求类型与地址
xhr.open('POST', 'http://www.liulongbin.top:3006/api/formdata')
// 直接提交 FormData 对象实例，将实例fd作为参数发送请求
// 与提交网页表单的效果一样

xhr.onreadystatechange = () => {
  if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
    console.log(JSON.parse(xhr.responseText))
  }
}
console.log('-> fd', fd)
xhr.send(fd)
// 无需设置 xhr.setHeader 的数据类型
