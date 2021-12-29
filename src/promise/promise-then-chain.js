// 运行 node src/promise/promise-then-chain.js
let p1 = Promise.resolve()
  // thenA
  .then(() => console.log(1) /*return undefined*/) // .resolve(undefined) // Promise {<fulfilled>: undefined}
  // thenC
  .then(() => console.log(2)) // Promise {<fulfilled>: undefined}
  // thenE
  .then(() => console.log(3)) // Promise {<fulfilled>: undefined}

// thenG
p1.then(() => console.log(4)) // Promise {<fulfilled>: undefined} .then(....)
// thenH
p1.then(() => console.log(5))

let p2 = Promise.resolve()
  // thenB
  .then(() => console.log(11)) // Promise {<fulfilled>: undefined}
  // thenD
  .then(() => console.log(22)) // Promise {<fulfilled>: undefined}
  // thenF
  .then(() => console.log(33)) // Promise {<fulfilled>: undefined}

// thenI
p2.then(() => console.log(44))
// thenJ
p2.then(() => console.log(55))

/*
- sync code
  - Promise
- async code
  - micro task queue turn1
    - [p1.resolve()+{....}, p2.resolve()+{....}]
  - micro task queue turn2
    - [thenA+{....}, thenB+{....}]
  - micro task queue turn3
    - [thenC+{....}, thenD+{....}]
  - micro task queue turn4
    - [thenE+{....}, thenF+{....}]
  - micro task queue turn5
    - [thenG, thenH]
  - micro task queue turn6
    - [thenI, thenJ]

*  连续链式调用 .then().then() 时 的运行机制
*  分开链式调用 p.then() 时 的运行机制
*  交替分开链式调用 p1.then(); p2.then() 时 的运行机制
*
*  公理1： 只有当前Promise对象resolve后，才会触发让其后的.then(fn)中的fn加入微任务队列
*  公理2： 执行语句时return的是undefined，会导致当前promise对象自动resolve(undefined) 返回Promise {<fulfilled>: undefined}
*  公理3： 对于一个处于pending状态的Promise对象p，只有当内部状态resolved，才会让p.then(fn)中的fn加入微任务队列
*
* */
