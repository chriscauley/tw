import after from './after'

export default (piece, move) => {
  move = after(move, () => {
    piece._sprite = ' hide'
    piece.invulnerable = true
  })
  return {
    ...move,
    done: true,
    preMove: () => {
      // #! TODO preMove should function like after(move)
      piece._sprite = ''
      piece.invulnerable = false
    },
  }
}
