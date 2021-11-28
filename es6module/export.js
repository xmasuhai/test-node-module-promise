export let v1 = 'a'
export const v2 = 2
export function f1() { }
export class c1 { }
// export { v1, v2, f1, c1 } //不可重复导出，会报错
export default { v1, v2, f1, c1 }

/*
let v3
export v3 = 3
 */

