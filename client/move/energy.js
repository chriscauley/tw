import after from './after'
import ifThen from './ifThen'
import { curry } from 'lodash'

const use = (energy_type, amount) =>
  ifThen((piece, move) => {
    const pass = piece[energy_type] >= amount
    if (pass && move) {
      // paint doesn't pass move in
      move.done = true
      after(move, () => {
        piece[energy_type] -= amount
      })
    }
    return pass
  })

const add = (energy_type, amount) => (piece, move) => {
  if (piece[energy_type] === undefined) {
    piece[energy_type] = 0
  }
  after(move, () => (piece[energy_type] += amount))
  return move
}

const set = (energy_type, amount) => (piece, move) =>
  after(move, () => (piece[energy_type] = amount))

const has = (energy_type, amount) =>
  ifThen(piece => piece[energy_type] >= amount)

const hasNot = (energy_type, amount) =>
  ifThen(piece => piece[energy_type] < amount)

const equals = (energy_type, amount) =>
  ifThen(piece => piece[energy_type] === amount)

const energy = energy_type => ({
  use: curry(use)(energy_type),
  has: curry(has)(energy_type),
  hasNot: curry(hasNot)(energy_type),
  add: curry(add)(energy_type),
  set: curry(set)(energy_type),
  equals: curry(equals)(energy_type),
})

Object.assign(energy, energy('energy'))

export default energy
