import uR from 'unrest.io'
import riot from 'riot'

window.riot = riot

import { newPlayer } from './piece/entity'
import piece_controller from './piece/system'
import * as player_controller from './piece/Player'
import Board from './board/Board'
import render_html from './render/html'

export default class Game extends uR.db.Model {
  static slug = 'game.Game'
  static opts = {
    RenderBoard: render_html.RenderBoard,
    parent: '#html-renderer',
    piece_generator: () => {},
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
      this.makePlayer()
      this.bindKeys()
      this.piece_generator(this)
      this.makeRenderer()
    })
  }

  nextTurn() {
    this.board.pieces.forEach(piece => {
      if (piece.type === 'player') {
        return
      }
      const move = piece_controller.getMove(piece)
      if (move) {
        piece_controller.applyMove(piece, move)
      }
    })
    this.trigger('nextturn')
  }

  makeBoard() {
    this.board = new Board({
      W: 9,
      H: 9,
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
