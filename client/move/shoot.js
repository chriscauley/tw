import after from './after'
import geo from '../geo'

export default _type => {
  const action = (piece, move, dxy = piece.dxy) => {
    const xy = geo.vector.add(piece.xy, dxy)
    if (piece.board.canAddFire(xy)) {
      move = after(move, () => {
        piece.board.addFire(1, xy, dxy)
      })
      move.done = true
    }
    return move
  }
  action.paint = (piece, _move) => [
    {
      xy: piece.xy,
      sprite: 'fireball dxy-' + piece.dxy.join(''),
    },
  ]
  return action
}
