import after from './after'

export default (props, done) => (piece, move) => {
  if (done) {
    move.done = true
  }
  return after(move, () => Object.assign(piece, props))
}
