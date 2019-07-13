import uR from 'unrest.io'
import Board from './Board'
import Game from '../game'

const playBoard = (path, data) => {
  const game = new Game({
    board: Board.objects.get(data.matches[1]),
    use_ui: true,
    victory_condition: data.matches[2],
    mook_set: data.matches[3],
  })

  game.ready.start()
  uR.router.one('route', game.unmount)
}

export default {
  '^#/board/(\\d+)/([^/]+)/([^/]+)/$': playBoard,
  '^#/board/edit/(\\d+)/$': uR.router.routeElement('edit-board'),
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
