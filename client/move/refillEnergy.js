export default (piece, move, _dxy) => ({
  ...move,
  afterMove: () => (piece.energy = piece.max_energy),
})
