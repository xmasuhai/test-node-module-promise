// 运行 node async_await/step-median.js
import {step1, step2, step3} from './stepFn.js'

// Promise
const doItPromise = (name = 'doItPromise') => {
  console.time(name)
  const time1 = 300
  // 每一个步骤都需要之前每个步骤的结果
  step1(time1, name)
    .then(time2 => {
      return step2(time2, name)
        // median // then 返回的中间值
        .then(time3 => [time1, time2, time3])
    })
    // median 中间值 times
    .then(times => {
      const [time1, time2, time3] = times
      return step3(time3, name)
        // median // then 返回的中间值
        .then(result => [time1, time2, time3, result])
    })
    .then(resultList => {
      const [, , , result] = resultList
      console.log(`${name} result is ${result}`)
    })
    .finally(() => {
      console.timeEnd(name)
    })
}

doItPromise()

// async
const doItAsync = async (name = 'doItAsync') => {
  console.time(name);
  const time1 = 300;
  const time2 = await step1(time1, name);
  const time3 = await step2(time2, name, time1);
  const result = await step3(time3, name, time2, time1);
  console.log(`${name} result is ${result}`);
  console.timeEnd(name)
}

doItAsync();