import uR from 'unrest.io'
import riot from 'riot'

window.riot = riot

import { newPlayer } from './piece/entity'
import piece_controller from './piece/system'
import * as player_controller from './piece/Player'
import follow from './piece/follow'
import Board from './board/Board'
import render_html from './render/html'
import { killAllEnemies } from './board/goal'

export default class Game extends uR.db.Model {
  static slug = 'game.Game'
  static opts = {
    RenderBoard: render_html.RenderBoard,
    parent: '#html-renderer',
    piece_generator: () => {},
    victory_condition: killAllEnemies,
  }
  constructor(opts) {
    super(opts)
    window.GAME = this
    riot.observable(this)
    this.ready = new uR.Ready()
    if (typeof this.parent === 'string') {
      this.parent = document.querySelector(this.parent)
    }

    this.ready(() => {
      this.makeBoard()
      this.makeVictoryContition()
      this.makePlayer()
      this.bindKeys()
      this.makePieceGenerator()
      this.spawnPieces()
      this.makeRenderer()
    })
  }

  makeVictoryContition() {
    this.checkVictory = this.victory_condition(this)
  }

  makePieceGenerator() {
    this.spawnPieces = this.piece_generator(this)
  }

  nextTurn() {
    if (this.checkVictory()) {
      this.spawnPieces()
    } else {
      // pieces should eventually handle which team is moving
      const pieces = this.board.pieces.filter(p => p.type !== 'player')
      follow(pieces) // #! TODO this takes upto 15ms!
      pieces.forEach(piece => {
        const move = piece_controller.getMove(piece)
        if (move) {
          piece_controller.applyMove(piece, move)
        }
      })
    }
    this.trigger('nextturn')
  }

  makeBoard() {
    this.board = new Board({
      _SEED: 11111111,
    })
  }

  makePlayer() {
    this.player = newPlayer({
      type: 'player',
      xy: [4, 4],
      dxy: [0, 1],
    })
    this.board.addPiece(this.player)
  }

  makeRenderer = () => {
    this.renderer = new this.RenderBoard({
      board: this.board,
      parent: this.parent,
    })
  }

  bindKeys() {
    this.key_map = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ' ': [0, 0],
    }

    this.keydown = e => {
      const input = {
        dxy: this.key_map[e.key],
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
      }
      if (input.dxy) {
        player_controller.move(this.player, input)
        this.nextTurn()
        this.renderer.update()
      }
    }

    this.ready(() => {
      this.controller = new uR.Controller({
        parent: this.parent,
        target: this,
      })
    })
  }
}
