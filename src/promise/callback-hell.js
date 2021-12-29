// 运行 node src/promise/callback-hell.js
// 延时1秒后执行函数
const delay = (time/* : number */, callback/* : Function */) => {
  setTimeout(() => {
    callback()
  }, time)
}

delay(1000, () => {
  console.log('第一次执行')

  delay(2000, () => {
    console.log('第二次执行')

    delay(3000, () => {
      console.log('第三次执行')

    })
  })
})
