import after from './after'

export default (piece, move, _dxy) => {
  if (!piece.energy || piece.energy < 0) {
    return {
      ...move,
      done: true,
    }
  }
  return after(move, () => piece.energy--)
}
