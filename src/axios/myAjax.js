import {XMLHttpRequest} from 'xmlhttprequest-ts'

function resolveData(data) {
  const arr = []
  for (let k in data) {
    arr.push(`${k}=${data[k]}`)
  }
  return arr.join('&')
}

export function myAjax(options) {
  const {method, url, data, successCb} = options
  const xhr = new XMLHttpRequest()
  // 拼接查询字符串
  const qs = resolveData(data)

  const reqMap = {
    'GET': () => {
      xhr.open(method, `${url}?${qs}`)
      xhr.send()
    },
    'POST': () => {
      xhr.open(method, url)
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.send(qs)
    },
    'PUT': () => {},
    'DELETE': () => {},
    'HEAD': () => {},
    'OPTION': () => {}
  }

  // 监听请求状态改变事件
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const res_JSONObj = JSON.parse(xhr.responseText /* xhr.responseText JSONString*/)
      successCb(res_JSONObj)
    }
  }

  reqMap[`${method.toUpperCase()}`](method, url, qs)

}
