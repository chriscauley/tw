import geo from '../geo'
import Random from 'ur-random'
import control from '../piece/system'

const _circle = geo.look._circle['1,0']

export default range => (piece, move, _dxy) => {
  const dxys = [..._circle[range]]
  Random.fp.shuffle(piece, dxys)
  dxys.find(target_dxy => {
    const target_xy = geo.vector.add(piece.xy, target_dxy)
    if (control.canMoveOn(piece, target_xy)) {
      move = {
        ...move,
        xy: target_xy,
        done: true,
        end: true, // takes all turns
      }
      return true
    }
  })
  return move
}
