export default (piece, move, _dxy) => {
  if (!piece.energy || piece.energy < 0) {
    return {
      ...move,
      done: true,
    }
  }
  return {
    ...move,
    afterMove: () => {
      piece.energy--
    },
  }
}
