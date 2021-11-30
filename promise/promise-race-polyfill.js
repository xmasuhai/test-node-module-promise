Promise.prototype.myRace = function (list /* : Array<Promise> */) {
  return new Promise(function (resolve, reject) {
    for (let arrayElement of list) {
      // 获取每一个　Promise　实例
      // 如果传入的数据非　Promise　实例 会自动通过　Promise.resolve　转化Promise实例
      let p = arrayElement
      p.then(res => {resolve(res)})
        .catch(err => {reject(err)})
    }
  })
}
