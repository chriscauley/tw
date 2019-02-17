import tasks from '../piece/tasks'

export const randomPiece = game => {
  const enemies = 'd'
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
        type: tasks.short2type[short],
        dxy: [0, -1],
        health: 2,
        _PRNG: board.random.int(), //# !TODO ibid
      })
    })
  }
}
