// 运行 node src/promise/promise-then-chain.js

let p1 = Promise.resolve()
  .then(function f1(v) { console.log(1) })
  .then(function f2(v) { console.log(2) })
  .then(function f3(v) { console.log(3) })

p1.then(function f4(v) { console.log(4) })
p1.then(function f5(v) { console.log(5) })

let p2 = Promise.resolve()
  .then(function f11(v) { console.log(11) })
  .then(function f22(v) { console.log(22) })
  .then(function f33(v) { console.log(33) })

p2.then(function f44(v) { console.log(44) })
p2.then(function f55(v) { console.log(55) })
