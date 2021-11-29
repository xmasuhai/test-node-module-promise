import { getFile } from './promise-getFile.js'

getFile('./files/1.txt').then(
  (r1) => { console.log(r1); },
  (err) => { console.log(err.message); }
)

getFile('./files/11.txt').then(
  (r1) => { console.log(r1); }
).catch(err => { console.log(err.message); })
