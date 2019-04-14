import _ from 'lodash'

import { randomEmptyXY } from '../lib'

export const randomPiece = ({ board }) => {
  return () => {
    board.rooms.forEach(room => {
      _.range(board.mook_count).forEach(() => {
        const name = board.random.choice(board.mooks)
        board.newPiece({
          xy: randomEmptyXY(board, room.xys),
          type: name,
          _PRNG: board.random.int(),
        })
      })
    })
  }
}
