import after from './after'
import geo from '../geo'

export default _type => (piece, move, dxy = piece.dxy) => {
  const xy = geo.vector.add(piece.xy, dxy)
  if (piece.board.canAddEnergy(xy)) {
    move = after(move, () => {
      piece.board.addEnergy(1, xy, dxy)
    })
    move.done = true
  }
  return move
}
