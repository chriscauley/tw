import types from '../piece/types'
import _ from 'lodash'

export const randomPiece = game => {
  const enemies = 'sjcdwb'
  const enemy_count = 50
  const { board } = game

  return () => {
    _.range(enemy_count).forEach(i => {
      const short = enemies[i % enemies.length]
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
