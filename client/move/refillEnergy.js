import after from './after'

export default (piece, move, _dxy) =>
  after(move, () => (piece.energy = piece.max_energy))
