// 从 export_default.js 模块中导入 export default 向外共享的成员，并命名为 m1
import m1 from './export_default.js'
const m2 = m1
console.log('[ m1 ] >', m1)
// 输出：{n1: 10, show: [Function: show]}
