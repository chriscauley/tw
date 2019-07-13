import uR from 'unrest.io'
import riot from 'riot'
import { pick } from 'lodash'

import { applyMove, movePlayer, respawn } from './lib'
import { newPlayer } from './piece/entity'
import goals from './board/goals'
import follow from './piece/follow'

// moved these imports down because getMove should probably be in it's own file
// getMove is originally from piece/lib, but was causing circular import
import { applyBuff } from './move/buff'
import types from './piece/types'
export const getMove = piece => {
  let move = applyBuff(piece, {})
  if (move.done) {
    return move
  }
  types[piece.type].tasks.find(task => {
    move = task(piece, move)
    if (move && move.done) {
      return move
    }
  })

  return move
}

export default class Game extends uR.db.Model {
  static slug = 'game.Game'
  static fields = {
    turn: 0,
  }
  static opts = {
    parent: '#main',
    victory_condition: undefined,
    room_count: 1,
    board: uR.REQUIRED,
    mookset: uR.REQUIRED,
    bossset: uR.REQUIRED,
    enemies: true,
    _PRNG: undefined,
    use_ui: false,
    player: undefined,
  }
  constructor(opts) {
    super(opts)
    window.GAME = this
    riot.observable(this)
    this.player_moves = []
    this.mook_count = 5
    this.board.game = this
    this.board.mookset = this.mookset
    this.board.bossset = this.bossset
    this.ready = new uR.Ready()
    if (typeof this.parent === 'string') {
      this.parent = document.querySelector(this.parent)
    }

    this.ready(() => {
      this.board.setPRNG(this._PRNG) // random if undefined
      this.board.reset()
      this.makePlayer()
      this.bindKeys()
      this.board.consumeGold()
      this.makeRenderer()
    })
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
    if (move.turns) {
      this.piece_turns[piece.id] += move.turns
      if (this.piece_turns[piece.id] > 100) {
        // This is an easy place to accidentally make an inifinte loop
        throw 'Piece was given too many turns'
      }
    }
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
    this.busy = true
    if (goals.check(this)) {
      this.gamewon()
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
      this.board.applyFire()
      this.board.moveFire()
      this.board.applyFire()
      this.doTurns(pieces, true)
    }
    this.finishTurn()
  }

  finishTurn = () => {
    const dirty_layers = this.board.resolveFloor()
    this.board.checkDialog()
    if (this.player.health <= 0) {
      if (!this.player.lives > 0) {
        return this.gameover()
      }
      respawn(this.player)
    }
    this.trigger('nextturn')
    this.turn++
    this.board.renderer.captureFrame(dirty_layers)
    this.busy = false
  }

  makePlayer() {
    if (this.player !== undefined) {
      return
    }
    this.player = newPlayer({
      type: 'player',
      dxy: [0, 1],
      xy: this.board.getCenter(),
    })
    // #! TODO the following attributes should be options on newPlayer
    this.player.combo = 0
    this.player.combo_parts = 0
    this.player.gold = 0
    this.player.ash = 0
    this.player.kills = 0
    this.player.kill_map = {}
    this.board.setPlayer(this.player)
  }

  makeRenderer = () => {
    if (this.use_ui) {
      uR.element.create('tw-ui', { parent: this.parent }, { game: this })
    }
    this.board.renderer.update()
  }

  bindKeys() {
    this.key_map = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ' ': [0, 0],
    }

    this.keydown = _event => {
      const event = pick(_event, ['key', 'shiftKey', 'ctrlKey'])
      if (this.busy) {
        return
      }
      const input = {
        dxy: this.key_map[event.key],
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        turn: this.turn,
      }
      if (input.dxy) {
        _event.preventDefault && _event.preventDefault()
        this.player_moves.push(event)
        if (this.player.health > 0 && !this.player.dead) {
          movePlayer(this.player, input)
          if (!this.player.combo && !this.player.combo_parts) {
            // players combo just broke, consume all gold on board
            this.board.consumeGold()
          }
        }
        this.board.renderer.reset()
        this.nextTurn()
        this.board.renderer.update()
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

  gameover() {
    this.controller.unmount()
    uR.element.alert('tw-gameover', {}, { game: this })
  }
  gamewon() {
    this.controller.unmount()
    uR.element.alert('tw-gamewon', {}, { game: this })
  }
}
