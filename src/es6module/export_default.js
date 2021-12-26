let n1 = 10 // 定义模块私有成员 n1
let n2 = 20 // 定义模块私有成员 n2，未共享，外界访问不到 n2
function show() { } // 定义模块私有方法 show
console.log("-> n2", n2);

export default { // 使用 export default 默认导出语法，向外共享 n1 和 show 两个成员
  n1,
  show
}

/*
export default {
  n2
}
 */
