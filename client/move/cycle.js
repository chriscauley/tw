export default (...actions) => {
  let i = 0
  return (piece, move) => {
    const task = actions[i]
    move = task(piece, move)
    if (move.done) {
      move.afterMove = () => (i = (i + 1) % actions.length)
    }
    return move
  }
}
