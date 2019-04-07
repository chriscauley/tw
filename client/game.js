import uR from 'unrest.io'
import riot from 'riot'

import { newPlayer } from './piece/entity'
import lib from './piece/lib'
import * as player_controller from './piece/Player'
import follow from './piece/follow'
import render_html from './render/html'
import { killAllEnemies } from './board/goal'

export default class Game extends uR.db.Model {
  static slug = 'game.Game'
  static fields = {
    turn: 0,
  }
  static opts = {
    RenderBoard: render_html.RenderBoard,
    parent: '.html-renderer',
    piece_generator: () => {},
    victory_condition: killAllEnemies,
    room_count: 1,
    board: uR.REQUIRED,
  }
  constructor(opts) {
    super(opts)
    window.GAME = this
    riot.observable(this)
    this.board.game = this
    this.ready = new uR.Ready()
    if (typeof this.parent === 'string') {
      this.parent = document.querySelector(this.parent)
    }

    this.ready(() => {
      this.makeVictoryContition()
      this.board.reset()
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

  nextTurn = () => {
    if (this.checkVictory()) {
      this.spawnPieces()
    } else {
      this.deferred = []
      // pieces should eventually handle which team is moving
      const pieces = this.board.getPieces().filter(p => p.type !== 'player')
      follow(pieces) // #! TODO this takes upto 15ms!
      pieces.forEach(piece => {
        piece.can_defer = true
        this.doTurn(piece)
      })
      this.doDeferred(true)
      this.board.checkDialog()
    }
    this.trigger('nextturn')
    this.turn++
  }

  doDeferred(can_defer) {
    const deferred = this.deferred
    deferred.reverse()
    this.deferred = []
    deferred.forEach(([turns, piece]) => {
      piece.can_defer = can_defer
      this.doTurn(piece, turns)
    })
    if (can_defer || this.deferred.length !== deferred.length) {
      this.doDeferred(false)
    }
  }

  doTurn(piece, turns = piece.turns) {
    for (let i = 0; i < turns; i++) {
      const move = lib.getMove(piece)
      if (move.defer) {
        this.deferred.push([turns - i, piece])
        break
      }
      if (move) {
        lib.applyMove(piece, move, this.turn)
        if (move.end) {
          break
        }
      }
    }
  }

  makePlayer(xy = [3, 3]) {
    this.player = newPlayer({
      type: 'player',
      dxy: [0, 1],
      xy,
    })
    this.board.player = this.player
    this.board.setPiece(xy, this.player)
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
        turn: this.turn,
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
