import geo from '../geo'

export default (piece, move) => ({
  ...move,
  dxy: geo.vector.times(piece.dxy, -1),
  done: true,
})
