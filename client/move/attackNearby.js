import geo from '../geo'
import forward from './forward'
import control from '../piece/system'
import Random from 'ur-random'

const dxy_list = [...geo.dxy.list]

export default (piece, move) => {
  for (const direction of Random.fp.shuffle(piece, dxy_list)) {
    const square = geo.look.lookOne(piece.square, direction)
    if (square && control.canAttackSquare(piece, square)) {
      return forward(piece, move, direction)
    }
  }
  return move
}
