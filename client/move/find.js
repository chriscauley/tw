import paint from './paint'

export default paint.manyActions(actions => (piece, move, dxy) => {
  for (const action of actions) {
    const result = action(piece, move, dxy)
    if (result.done) {
      return result
    }
  }
  return move
})
