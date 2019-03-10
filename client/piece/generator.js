import types from '../piece/types'
import control from '../piece/system'
import _ from 'lodash'

export const randomPiece = game => {
  const enemies = 'p' //'bsjcdw'
  const enemy_count = 3
  const { board } = game

  return () => {
    _.range(enemy_count).forEach(i => {
      const short = enemies[i % enemies.length]
      let xy
      let tries = 0
      /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
      while (true) {
        tries++
        if (tries > 100) {
          throw 'unable to find square!'
        }
        //#! TODO this should it's own randomness
        xy = [board.random.int(board.W), board.random.int(board.H)]
        if (control.canMoveOn({ board }, xy)) {
          break
        }
      }
      board.newPiece({
        xy,
        type: types.short2type[short],
        _PRNG: board.random.int(), //# !TODO ibid
      })
    })
  }
}
