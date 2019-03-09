export default (piece, move) => {
  return {
    ...move,
    done: true,
    afterMove: () => {
      piece._sprite = ' hide'
      piece.invulnerable = true
    },
    preMove: () => {
      piece._sprite = ''
      piece.invulnerable = false
    },
  }
}
