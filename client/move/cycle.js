export default (...actions) => {
  const tick = piece => (piece.i_cycle = (piece.i_cycle + 1) % actions.length)

  return (piece, move) => {
    const task = actions[piece.i_cycle]
    move = task(piece, move)
    move.afterMove = tick
    return move
  }
}
