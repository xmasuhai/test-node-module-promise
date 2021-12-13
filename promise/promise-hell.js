// 运行 node promise/promise-hell.js
import thenFs from 'then-fs'

// bad
thenFs.readFile('./files/path-a.txt', 'utf8')
  .then(res => {
    console.log('bad', res) // './files/path-b.txt'
    thenFs.readFile(res, 'utf8')
      .then(res => {
        console.log('bad', res) // './files/path-c.txt'
        thenFs.readFile(res, 'utf8')
          .then(res => {
            console.log('bad', res) // './files/path-a.txt'
          })
          .catch(err => {
            console.log(err.message)
          })
      })
      .catch(err => {
        console.log(err.message)
      })
  })
  .catch(err => {
    console.log(err.message)
  })

// good
thenFs.readFile('./files/path-a.txt', 'utf8')
  .then(res => {
    console.log('good', res)
    return thenFs.readFile(res, 'utf8')
  })
  .then(res => {
    console.log('good', res)
    return thenFs.readFile(res, 'utf8')
  })
  .catch (err => {console.log(err)})

// abbr
thenFs.readFile('./files/path-a.txt', 'utf8')
  .then(res => thenFs.readFile(res, 'utf8'))
  .then(res => thenFs.readFile(res, 'utf8'))
  .catch (err => {console.log(err)})