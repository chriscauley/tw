import after from './after'
import ifThen from './ifThen'
import { curry } from 'lodash'

const use = (type, amount) =>
  ifThen((piece, move) => {
    const pass = piece[type] >= amount
    if (pass) {
      after(move, () => {
        piece[type] -= amount
      })
    }
    return pass
  })

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
const hasNot = (type, amount) => ifThen(piece => piece[type] < amount)

const energy = type => ({
  use: curry(use)(type),
  has: curry(has)(type),
  hasNot: curry(hasNot)(type),
  add: curry(add)(type),
  set: curry(set)(type),
})

Object.assign(energy, energy('energy'))

export default energy
