import after from './after'
export default (...actions) => {
  const tick = piece => (piece.i_cycle = (piece.i_cycle + 1) % actions.length)

  return (piece, move) => {
    move = actions[piece.i_cycle](piece, move)
    return after(move, tick)
  }
}
