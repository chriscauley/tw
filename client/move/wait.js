export default turns => {
  const tick = piece => piece.waiting--
  const reset = piece => (piece.waiting = turns)

  return (piece, move) => {
    if (!piece.waiting) {
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
