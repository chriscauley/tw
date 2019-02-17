import geo from '../geo'
import forward from './forward'
import control from '../piece/system'

const dxy_list = [...geo.dxy.list]

export default (piece, move) => {
  for (const direction of control.randomShuffle(piece, dxy_list)) {
    const square = geo.look.lookOne(piece.square, direction)
    if (square && control.canAttackSquare(piece, square)) {
      return forward(piece, move, direction)
    }
  }
  return move
}
