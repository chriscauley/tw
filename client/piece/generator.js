import _ from 'lodash'

import { canMoveOn } from '../lib'

const randomEmptyXY = (board, xys) => {
  for (let _i = 0; _i < 100; _i++) {
    const xy = board.random.choice(xys)
    if (canMoveOn({ board }, xy)) {
      return xy
    }
  }
  throw 'unable to find square!'
}

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
