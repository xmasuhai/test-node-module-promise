// 运行 node async_await/step.js
const takeLongTime = (n, name) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(n + 200, name), n)
  })
}

const step1 = (n, name) => {
  console.log(`${name} step1 with ${n}`)
  return takeLongTime(n, name)
}

const step2 = (n, name) => {
  console.log(`${name} step2 with ${n}`)
  return takeLongTime(n, name)
}

const step3 = (n, name) => {
  console.log(`${name} step3 with ${n}`)
  return takeLongTime(n, name)
}

// Promise
const doItPromise = (name = 'doItPromise') => {
  console.time(name)
  const time1 = 300
  step1(time1, name)
    .then(time2 => step2(time2, name))
    .then(time3 => step3(time3, name))
    .then(result => {
      console.log(`${name} result is ${result}`)
    })
    .finally(() => {
      console.timeEnd(name)
    })
}

doItPromise()

// async Function
const doItAsync = async (name = 'doItAsync') => {
  console.time(name)
  const time1 = 300
  const time2 = await step1(time1, name)
  const time3 = await step2(time2, name)
  const result = await step3(time3, name)
  console.log(`${name} result is ${result}`)
  console.timeEnd(name)
}

doItAsync()

