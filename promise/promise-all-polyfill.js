Promise.prototype.myAll = function (list /* : Array<Promise> */) {
  const arr = []
  // 返回一个新的Promise实例
  return new Promise(function (resolve, reject) {
    for (let i = 0; i < list.length; i++) {
      let p = list[i]

      // 每一个实例的成功和失败时执行的内容  => 请求有结果之后会执行
      p
        .then(res => {
          // 等待异步操作有结果之后 对应下标放到数组中
          arr[i] = res

          // 所有的请求全都成功
          arr.length === list.length
            ? resolve(arr)
            : null

        })
        .catch(err => {
          // 只要有一个失败 就走catch // console.log(err)
          reject(err)
        })
    }

  })
}
