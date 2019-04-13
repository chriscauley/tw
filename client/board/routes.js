import uR from 'unrest.io'
import Board from './Board'
import Game from '../game'
import { randomPiece } from '../piece/generator'

import './tags'

const playBoard = (path, data) => {
  const board = Board.objects.get(data.matches[1])
  const game = new Game({
    board,
    piece_generator: randomPiece,
  })

  game.ready.start()
}

export default {
  '^#/board/(\\d+)/$': playBoard,
  '^$': uR.router.routeElement('board-menu'),
  '^/board/edit/(\\d+)/$': uR.router.routeElement('board-menu'),
}
