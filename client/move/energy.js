import after from './after'

const use = (type, amount, action) => (piece, move, dxy) => {
  if (piece[type] >= amount) {
    move = after(move, () => (piece[type] -= amount))
    return action(piece, move, dxy)
  }
  return move
}

const add = (type, amount = 1) => (piece, move) => {
  if (!piece[type]) {
    piece[type] = 0
  }
  after(move, () => (piece[type] += amount))
  return move
}

export default {
  add,
  use,
}
