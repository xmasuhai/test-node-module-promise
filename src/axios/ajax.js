export const http = (method, url, data) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest() // 创建XMLHttpRequest对象
// 异步ajax，监听readystatechange事件，设置回调函数
    xhr.onreadystatechange = () => { // 状态发生变化时，函数被回调
      if (xhr.readyState === 4) { // 成功完成
        // 判断响应状态码
        if (xhr.status !== 200) xhr.onerror = () => reject(xhr) // 失败，根据响应码判断失败原因:
        xhr.onload = () => resolve(xhr.responseText, xhr) // 成功，通过responseText拿到响应的文本:
      } else {
        // HTTP请求还在继续...
      }
    }

    // 发送请求:
    xhr.open(method, url)
    // xhr.open('GET', '/api/categories')
    xhr.setRequestHeader('Content-Type', 'application/json') // 设置请求头
    xhr.send(data) // 到这一步，请求才正式发出

  })
}
