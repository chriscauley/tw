import after from './after'

export default turns => {
  const tick = piece => piece.wait++
  const reset = piece => (piece.wait = 0)

  const action = (piece, move) => {
    if (piece.wait === undefined) {
      piece.wait = 0
    }
    if (piece.wait < turns) {
      return {
        ...after(move, tick),
        done: true,
      }
    }
    return after(move, reset)
  }

  action.paint = (piece, _move, _dxy) => [
    {
      xy: piece.xy,
      sprite: piece.wait >= turns ? 'wait-ready' : 'wait',
    },
  ]

  return action
}
