import types from '../piece/types'

export const randomPiece = game => {
  const enemies = 'ssjjc'
  const { board } = game

  return () => {
    enemies.split('').forEach(short => {
      let xy
      while (!xy) {
        //#! TODO this should it's own randomness
        const x = board.random.int(board.W)
        const y = board.random.int(board.H)
        const square = board.getSquare([x, y])
        if (!square.piece) {
          xy = square.xy
        }
      }
      board.newPiece({
        xy: xy,
        type: types.short2type[short],
        health: 1,
        _PRNG: board.random.int(), //# !TODO ibid
      })
    })
  }
}
