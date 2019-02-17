import uR from 'unrest.io'
import './geo/preview.tag'
import Game from './game'

uR.router.add({
  '^#/look-preview/$': uR.router.routeElement('look-preview'),
})

const all_zombies = game => {
  game.board.newPiece({
    xy: [1, 1],
    type: 'walker',
    dxy: [0, -1],
  })
  game.board.newPiece({
    xy: [8, 8],
    type: 'seeker',
    dxy: [0, 0],
  })
  game.board.newPiece({
    xy: [7, 0],
    type: 'drifter',
    dxy: [0, 0],
  })
}

uR.router.default_route = _path => {
  const game = new Game({
    piece_generator: all_zombies,
  })
  game.ready.start()
}
