export const takeLongTime = (n, name, ...args) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(n + 200, name, ...args), n)
  })
}

export const step1 = (n, name, ...args) => {
  console.log(`${name} step1 with ${n}`)
  return takeLongTime(n, name, ...args)
}

export const step2 = (n, name, ...args) => {
  console.log(`${name} step2 with ${n}`)
  return takeLongTime(n, name, ...args)
}

export const step3 = (n, name, ...args) => {
  console.log(`${name} step3 with ${n}`)
  return takeLongTime(n, name, ...args)
}
