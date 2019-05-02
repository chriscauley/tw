import geo from '../geo'
import { canMoveOn } from '../lib'
import _ from 'lodash'
import Random from 'ur-random'

const absmax = dxys => _.maxBy(dxys, geo.vector.magnitude)
const target_dxys = _.range(9).map(range =>
  _.flatten(geo.dxy.list.map(dxy => geo.look._three[dxy][range])),
)

export default max_range => {
  return (piece, move) => {
    let range = Math.abs(max_range)
    while (range) {
      const target_dxy = Random.fp
        .shuffle(piece, [...target_dxys[range]])
        .find(dxy => canMoveOn(piece, geo.vector.add(dxy, piece.xy)))
      if (!target_dxy) {
        range--
        continue
      }
      const target_xy = geo.vector.add(target_dxy, piece.xy)
      const [dx, dy] = geo.vector.subtract(piece.xy, target_xy)
      const dxy = geo.vector.sign(absmax([[dx, 0], [0, dy]]))
      return {
        ...move,
        xy: target_xy,
        dxy,
        done: true,
        end: true, // takes all turns
      }
    }
  }
}
