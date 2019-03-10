import control from '../piece/system'

export default (piece, move, _dxy) => {
  return {
    ...move,
    afterMove: () => control.applyDamage(piece, piece.health),
  }
}
