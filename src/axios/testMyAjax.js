import {myAjax} from './myAjax.js'

myAjax({
  method: 'GET',
  url: 'http://liulongbin.top:3006/api/getbooks',
  data: {
    id: 1
  },
  successCb: (res) => {
    const {data} = res
    console.log(res)
    console.log(data)
  }
})

myAjax({
  method: 'GET',
  url: 'http://liulongbin.top:3006/api/getbooks',
  /*data: {
    id: 1
  },*/
  successCb: (res) => {
    const {data} = res
    console.log(res)
    console.log(data)
  }
})

myAjax({
  method: 'POST',
  url: 'http://liulongbin.top:3006/api/addbook',
  data: {
    bookname: 'Red',
    author: 'Red',
    publisher: 'Red'
  },
  successCb: (res) => {
    console.log(res)
  }
})
