import _ from 'lodash'

import { randomEmptyXY } from '../lib'

export const randomPiece = ({ board }) => {
  const enemy_count = 3
  return () => {
    board.rooms.forEach(room => {
      _.range(enemy_count).forEach(() => {
        const name = board.random.choice(board.pieces)
        board.newPiece({
          xy: randomEmptyXY(board, room.xys),
          type: name,
          _PRNG: board.random.int(),
        })
      })
    })
  }
}
