import geo from '../geo'
import { randomEmptyXY } from '../lib'

const _circle = geo.look._circle['1,0']

export default range => (piece, move, _dxy) => {
  const target_xy = randomEmptyXY(
    piece.board,
    geo.look.lookMany(piece.xy, _circle[range]),
  )
  return {
    ...move,
    xy: target_xy,
    done: true,
    end: true, // takes all turns
  }
}
