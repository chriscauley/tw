import uR from 'unrest.io'
import './geo/preview.tag'
import Game from './game'
import { randomPiece } from './piece/generator'

uR.router.add({
  '^#/look-preview/$': uR.router.routeElement('look-preview'),
})

uR.router.default_route = _path => {
  const game = new Game({
    piece_generator: randomPiece,
  })
  game.ready.start()
}
