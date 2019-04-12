import after from './after'

export default turns => {
  const tick = piece => piece.waiting--
  const reset = piece => (piece.waiting = turns)

  return (piece, move) => {
    if (!piece.waiting) {
      return after(move, reset)
    }
    return {
      ...after(move, tick),
      done: true,
    }
  }
}
