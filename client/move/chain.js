export default actions => (piece, move, dxy) => {
  actions.forEach(action => {
    move = action(piece, move, dxy)
  })
  return move
}
