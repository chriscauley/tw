import geo from '../../geo'
import { canAttack } from '../../lib'

const { vector, look } = geo

export const getAttack = (weapon, piece, dxy) => {
  if (!dxy || vector.isZero(dxy)) {
    return
  }

  const { range, geometry, splash } = weapon
  // #! TODO should check 0 to range-1 to make sure weapon isn't blocked
  // this could include a way for "phasing" weapons to attack through things
  const target_dxys = look[geometry][dxy][range]
  const matching_moves = target_dxys
    .map(dxy => ({ dxy, xy: vector.add(piece.xy, dxy) }))
    .filter(({ xy }) => canAttack(piece, xy))
  if (!splash) {
    return matching_moves.slice(0, 1)
  }
  return matching_moves
}
