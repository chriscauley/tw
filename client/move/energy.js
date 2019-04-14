import after from './after'
import ifThen from './ifThen'
import { curry } from 'lodash'

const use = (type, amount) => ifThen(piece => piece[type] >= amount)

const add = (type, amount) => (piece, move) => {
  if (!piece[type]) {
    piece[type] = 0
  }
  after(move, () => (piece[type] += amount))
  return move
}

const set = (type, amount) => (piece, move) =>
  after(move, () => (piece[type] = amount))

const has = (type, amount) => ifThen(piece => piece[type] >= amount)

const energy = type => ({
  use: curry(use)(type),
  has: curry(has)(type),
  add: curry(add)(type),
  set: curry(set)(type),
})

Object.assign(energy, { add, use, has, set })

export default energy
