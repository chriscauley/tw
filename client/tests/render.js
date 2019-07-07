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

const wrapper = document.createElement('div')
wrapper.className = 'card'
document.body.appendChild(wrapper)

const startSquareGame = ({ W, H, _entities = {}, game_opts = {} }) => {
  const parent = document.createElement('div')
  parent.className = 'test card-body'
  wrapper.appendChild(parent)
  const square = {}
  range(W).map(x => range(H).map(y => (square[x + y * W] = 1)))
  const game = new Game({
    parent,
    board: new Board({
      _entities: {
        square,
        ..._entities,
      },
      W,
      H,
    }),
    ...game_opts,
  })
  game.ready.start()
  return game
}

uR.db.ready(() => {
  slicer.css.createAllSpriteCSS()
  describe('Renderer', function() {
    it('Zooming in and out gives the correct number of squares ', function() {
      const game1 = startSquareGame({ W: 5, H: 5 })
      const renderer = (window.R = game1.board.renderer)

      expect(renderer.frames[0].square.length).to.equal(25)
      expect(renderer.dxys.length).to.equal(25)
      renderer.setZoom({ offset: 0, diameter: 3 })
      expect(renderer.frames[0].square.length).to.equal(9)
      expect(renderer.dxys.length).to.equal(9)
    })

    it('Moving the player only changes origin if renderer.follow_player', function() {
      const game2 = startSquareGame({ W: 4, H: 4 })
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

    it('Even and odd diameters both show ', function() {
      const game3 = startSquareGame({ W: 8, H: 8 })
      const renderer = (window.R3 = game3.board.renderer)
      renderer.setZoom({ origin: [0, 0], follow_player: false })
      expect(renderer.origin).to.deep.equal([0, 0])
    })

    it('Board.shift', function() {
      const game4 = startSquareGame({ W: 3, H: 3 })
      const board = (window.BOARD = game4.board)
      /*board.newPiece({
        xy: [1,1],
        type: 'spitter',
      })*/
      board.renderer.update()
      const getSquares = b => Object.keys(b.entities.square).map(Number)
      expect(getSquares(board)).to.deep.equal(range(9))
      board.shift(1, 2)
      board.renderer.setZoom({})
      const shifted = [9, 10, 11, 13, 14, 15, 17, 18, 19]
      expect(getSquares(board)).to.deep.equal(shifted)
    })
  })

  describe('Game.battle', function() {
    it('skeleton vs pot', function() {
      const game_opts = { player: null }
      const _entities = {
        piece: {
          1: { type: 'seeker', xy: [1, 0] },
          7: { type: 'pot', xy: [1, 2], team: 1 },
        },
      }
      const game5 = startSquareGame({ W: 4, H: 3, game_opts, _entities })
      const seeker = game5.board.getOne('piece', [1, 0])
      const pot = game5.board.getOne('piece', [1, 2])
      expect(seeker.xy).to.deep.equal([1, 0])
      expect(pot.xy).to.deep.equal([1, 2])
      expect(seeker.team).to.equal(0)
      expect(pot.team).to.equal(1)
    })
  })
})
