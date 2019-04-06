import uR from 'unrest.io'

import Board from './board/Board'
import Game from './game'
import './geo/preview.tag'
import { randomPiece } from './piece/generator'

uR.router.add({
  '^#/look-preview/$': uR.router.routeElement('look-preview'),
  '^#/board/(\\d+)/$': (path, data) => {
    const board = Board.objects.get(data.matches[1])
    const game = new Game({
      board,
      piece_generator: randomPiece,
    })
    game.ready.start()
  },
})

uR.router.default_route = _path => {
  const game = new Game({
    piece_generator: randomPiece,
  })
  game.ready.start()
}
