import Game from '../game'
import Board from '../board/Board'
import '../tags'
import slicer from '../slicer'
import { range } from 'lodash'
import { expect } from 'chai'

import uR from 'unrest.io'

// const { Field, Model, String } = uR.db

// const uC = {
//   equals: (func, value) => test => {
//     expect(f(test)).to.equal(value)
//   }
// }

// class TestCase extends Model {
//   static opts = {
//     name: String,
//     board: Field,
//   }
//   constructor(opts, testFunction) {

//   }

//   run() {
//     const game1 = startSquareGame(5, 5)
//     it('Zooming in and out gives the correct number of squares ', function() {
//       this.renderer = window.R = game1.board.renderer

//   }
// }

// const TESTS = [
//   TestCase.objects.create({
//     name: 'Zooming in and out gives the correct number of squares',
//     board: [5,5],
//     steps: [

//       // 5x5 board defaults to 25 visible squares
//       uC.equals(numberOfFrameSquares, 25),
//       uC.equals(numberOfDxys, 25),

//       // resize to 3x3, only see 9
//       ({ renderer }) => renderer.setZoom({ offset: 0, diameter: 3 }),
//       uC.equals(numberOfFrameSquares, 9),
//       uC.equals(numberOfDxys, 9),
//     ]

//   })
// ]

const startSquareGame = (W, H) => {
  const parent = document.createElement('div')
  parent.className = 'html-renderer'
  document.body.appendChild(parent)
  const square = {}
  range(W).map(x => range(H).map(y => (square[x + y * W] = 1)))
  const game = new Game({
    parent,
    board: new Board({
      _entities: { square },
      W,
      H,
    }),
  })
  game.ready.start()
  return game
}

uR.db.ready(() => {
  slicer.css.createAllSpriteCSS()
  describe('Renderer', function() {
    const game1 = startSquareGame(5, 5)
    it('Zooming in and out gives the correct number of squares ', function() {
      const renderer = (window.R = game1.board.renderer)

      expect(renderer.frames[0].square.length).to.equal(25)
      expect(renderer.dxys.length).to.equal(25)
      renderer.setZoom({ offset: 0, diameter: 3 })
      expect(renderer.frames[0].square.length).to.equal(9)
      expect(renderer.dxys.length).to.equal(9)
    })

    const game2 = startSquareGame(4, 4)
    it('Moving the player only changes origin if renderer.follow_player', function() {
      const renderer = (window.R2 = game2.board.renderer)
      renderer.setZoom({ origin: [0, 0], follow_player: false })
      expect(renderer.origin).to.deep.equal([0, 0])
      game2.keydown({ key: 'ArrowUp' })
      expect(renderer.origin).to.deep.equal([0, 0])
      // there's an off by one somewhere in the x, y offests
      renderer.setZoom({ follow_player: true })
      expect(renderer.origin).to.deep.equal([0, -1])
      game2.keydown({ key: 'ArrowLeft' })
      expect(renderer.origin).to.deep.equal([-1, -1])
    })

    const game3 = startSquareGame(8, 8)
    it('Even and odd diameters both show ', function() {
      const renderer = (window.R3 = game3.board.renderer)
      renderer.setZoom({ origin: [0, 0], follow_player: false })
      expect(renderer.origin).to.deep.equal([0, 0])
    })
  })
})
