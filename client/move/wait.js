const tick = piece => piece.waited++
const reset = piece => (piece.waited = 0)

export default turns => {
  return (piece, move) => {
    piece.waited = piece.waited || 0
    if (piece.waited >= turns) {
      return {
        ...move,
        afterMove: reset,
      }
    }
    return {
      ...move,
      done: true,
      afterMove: tick,
    }
  }
}
