import geo from '../../geo'
import control from '../../piece/system'

const { vector, look } = geo

export default (weapon, piece, move, dxy) => {
  if (!dxy || vector.isZero(dxy)) {
    return
  }
  const target_xys = look.lookMany(
    piece.xy,
    look[weapon.geometry][dxy][weapon.range],
  )
  const damage_xys = target_xys.filter(xy => control.canAttack(piece, xy))
  if (damage_xys.length) {
    return {
      ...move,
      dxy,
      xys: damage_xys,
      count: weapon.damage,
      source: piece,
    }
  }

  return move
}
