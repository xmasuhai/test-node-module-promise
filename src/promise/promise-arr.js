import thenFs from 'then-fs'

export const promiseArrOK = [
  thenFs.readFile('./files/1.txt', 'utf8'),
  thenFs.readFile('./files/2.txt', 'utf8'),
  thenFs.readFile('./files/3.txt', 'utf8')
]

export const promiseArrOKReversal = [
  thenFs.readFile('./files/3.txt', 'utf8'),
  thenFs.readFile('./files/2.txt', 'utf8'),
  thenFs.readFile('./files/1.txt', 'utf8')
]

export const promiseArrErr = [
  thenFs.readFile('./files/11.txt', 'utf8'),
  thenFs.readFile('./files/2.txt', 'utf8'),
  thenFs.readFile('./files/3.txt', 'utf8')
]

export const promiseArrFail = [
  thenFs.readFile('./files/11.txt', 'utf8'),
  thenFs.readFile('./files/22.txt', 'utf8'),
  thenFs.readFile('./files/33.txt', 'utf8')
]

