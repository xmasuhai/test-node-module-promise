// 运行 node async_await/step.js
import {step1, step2, step3} from './stepFn.js'

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
