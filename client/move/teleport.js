import geo from '../geo'
import { randomEmptyXY } from '../lib'
import Random from 'ur-random'

const _circle = geo.look._circle['1,0']

export default range => (piece, move) => {
  const target_xy = randomEmptyXY(
    piece.board,
    geo.look.lookMany(piece.xy, _circle[range]),
  )
  const [dx, dy] = geo.vector.subtract(piece.xy, target_xy)
  const target_dxys = [[dx, 0], [0, dy]].filter(dxy => !geo.vector.isZero(dxy))
  const dxy = geo.vector.sign(Random.fp.choice(piece, target_dxys))
  return {
    ...move,
    xy: target_xy,
    dxy,
    done: true,
    end: true, // takes all turns
  }
}
