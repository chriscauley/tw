import uR from 'unrest.io'
import riot from 'riot'

import { getMove, applyMove, movePlayer } from './lib'
import { newPlayer } from './piece/entity'
import follow from './piece/follow'
import { randomPiece, randomBoss } from './piece/generator'
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
    victory_condition: killAllEnemies,
    room_count: 1,
    board: uR.REQUIRED,
    enemies: true,
  }
  constructor(opts) {
    super(opts)
    this.piece_generator = randomPiece
    this.boss_generator = randomBoss
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
      this.spawnPieces()
      this.makeRenderer()
    })
  }

  makeVictoryContition() {
    this.checkVictory = this.victory_condition(this)
  }

  spawnPieces = () => {
    if (!this.enemies) {
      return
    }
    this.piece_generator(this)
    this.boss_generator(this)
  }

  _doTurn(piece) {
    if (piece.dead) {
      // piece was killed during turn by another piece
      return
    }
    const move = getMove(piece)
    if (!move || move.defer) {
      return
    }
    applyMove(piece, move, this.turn)
    this.piece_turns[piece.id]--
    if (move.end) {
      this.piece_turns[piece.id] = 0
    }
  }

  doTurns(pieces, defer) {
    let last_count = Infinity
    let current_count = 0
    pieces.forEach(p => (p.can_defer = defer))
    while (current_count !== last_count) {
      // first move with deferral until no pieces make a move
      last_count = current_count
      current_count = 0
      pieces.forEach(piece => {
        // everyone takes one turn
        this._doTurn(piece)
        current_count += this.piece_turns[piece.id]
      })
      pieces = pieces.filter(p => this.piece_turns[p.id] > 0)
    }
    if (defer) {
      // Repeat with deferral off
      this.doTurns(pieces, false)
    }
  }

  nextTurn = () => {
    if (this.checkVictory()) {
      this.spawnPieces()
    } else {
      // #! TODO do priority tasks before (balls colliding head on)
      // pieces.filter(p => types[piece.type].priority_tasks)

      // #! TODO need a way to sort pieces (do balls first)

      // figure out how many turns each piece can take
      this.piece_turns = {}
      this.board
        .getPieces()
        .filter(p => p.type !== 'player')
        .forEach(p => (this.piece_turns[p.id] = p.turns))

      // pieces should eventually handle which team is moving
      const pieces = this.board.getPieces().filter(p => p.type !== 'player')
      follow(pieces) // #! TODO this takes upto 15ms!
      this.doTurns(pieces, true)
      this.board.checkDialog()
    }
    this.trigger('nextturn')
    this.turn++
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
        movePlayer(this.player, input)
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

  unmount = () => {
    this.controller.unmount()
    uR.element.emptyElement(document.querySelector('#main > .html-renderer'))
  }
}
