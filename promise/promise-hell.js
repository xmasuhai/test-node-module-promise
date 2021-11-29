import thenFs from 'then-fs'

thenFs.readFile('./files/path-a.txt', 'utf8')
  .then(result => {
    console.log(result) // './files/path-b.txt'
    thenFs.readFile(result, 'utf8')
      .then(result => {
        console.log(result) // './files/path-c.txt'
        thenFs.readFile(result, 'utf8')
          .then(result => {
            console.log(result) // end
          })
      })
      .catch(err => {
        console.log(err.message)
      })
  })
  .catch(err => {
    console.log(err.message)
  })