import paint from './paint'

export default paint.manyActions(actions => (piece, move, dxy) => {
  actions.forEach(action => {
    move = action(piece, move, dxy)
  })
  return move
})
