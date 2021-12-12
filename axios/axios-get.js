import axios from 'axios'

// 直接发起不带参数的请求
axios.get('/api/getbooks',
  {
    baseURL: 'http://www.liulongbin.top:3006/',
    timeout: 1000
  })
  .then(
    (res) => {
      const {data, status} = res
      console.log('直接发起不带参数的请求')
      console.log('data', data)
      console.log('status', status)
      console.log('-----------------')
    }
  )

// 先配置，后发起请求
const instance = axios.create({
  baseURL: 'http://www.liulongbin.top:3006/',
  timeout: 1000
})

const instance2 = axios.create({
  baseURL: 'http://www.liulongbin.top:3006/',
  timeout: 1000,
  params: {
    id: 1
  }
})

instance.get('/api/getbooks')
  .then(
    (res) => {
      const {data, status} = res
      console.log('// 先配置，后发起不带参请求')
      console.log('data', data)
      console.log('status', status)
      console.log('-----------------')
    }
  )

instance2.get('/api/getbooks')
  .then(
    (res) => {
      const {data, status} = res
      console.log('// 先配置，后发起带参数的请求 http://www.liulongbin.top:3006/api/getbooks?id=1')
      console.log('data', data)
      console.log('status', status)
      console.log('-----------------')
    }
  )
