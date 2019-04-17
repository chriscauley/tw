import uR from 'unrest.io'
import Board from './Board'
import Game from '../game'

import './tags'

const playBoard = (path, data) => {
  const board = Board.objects.get(data.matches[1])
  const game = new Game({
    board,
  })

  game.ready.start()
  uR.router.one('route', () => {
    console.warn('TODO: unmount game!')
    uR.element.emptyElement(document.querySelector('#main > .html-renderer'))
  })
}

export default {
  '^#/board/(\\d+)/$': playBoard,
  '^$': uR.router.routeElement('board-menu'),
  '^#!/board/new/$': uR.router.routeElement('ur-form', {
    model: Board,
  }),
  '^#!/board/edit/(\\d+)/$': uR.router.routeElement(
    'ur-form',
    (_path, data) => ({
      object: Board.objects.get(data.matches[1]),
    }),
  ),
}
