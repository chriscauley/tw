import after from './after'
import geo from '../geo'

export default _type => (piece, move, dxy = piece.dxy) => {
  move = after(move, () => {
    const xy = geo.vector.add(piece.xy, dxy)
    piece.board.addEnergy(1, xy, dxy)
  })
  move.done = true
  return move
}
