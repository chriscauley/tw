// Shared functionality for board and room
import _ from 'lodash'
import uR from 'unrest.io'
import Random from 'ur-random'

import Room from './Room'
import Item from '../item'
import DialogMixin from './dialog'
import { newPiece } from '../piece/entity'
import types from '../piece/types'
import { RenderBoard } from '../render/html'

const { Model, APIManager, List, Int, String } = uR.db

class Board extends DialogMixin(Random.Mixin(Model)) {
  static slug = 'server.Board'
  static editable_fieldnames = [
    'name',
    'room_generator',
    'item_generators',
    'room_count',
    'mook_count',
  ]
  static opts = {
    mookset: undefined,
    bossset: undefined,
  }
  static fields = {
    id: Int(),
    name: String(),
    room_generator: String('zelda', { choices: () => Room.generators }),
    item_generators: List('', {
      choices: Item.generators,
      initial: ['randomWeapon'],
    }),
    room_count: Int(1, { choices: _.range(1, 5) }),
    mook_count: Int(3, { choices: _.range(1, 10) }),
    mooks: List('', { choices: types.mook_map }),
    boss: String('', { choices: types.boss_map }),
  }
  __str__() {
    return this.name
  }
  i2xy = i => this._i2xy[i]
  xy2i = xy => this._xy2i[xy[0]][xy[1]]

  constructor(opts) {
    super(opts)
  }

  setPlayer = player => {
    // sets the board is now set to the players perspective
    this.player = player
    this.setPiece(player.xy, player)
    this.renderer.update(true)
  }

  getOne = (type, xy) => {
    return this.entities[type][this.xy2i(xy)]
  }

  getMany(type, xys) {
    return xys.map(xy => this.getOne(type, xy)).filter(i => i)
  }

  setOne(type, xy, obj) {
    this.entities[type][this.xy2i(xy)] = obj
  }

  setPiece(xy, piece) {
    const i = this.xy2i(xy)

    const old = this.entities.piece[i]
    if (old && old !== piece) {
      throw 'Pauli Exclusion error'
    }

    if (piece.xy && piece.board) {
      // remove from old position
      piece.board.removePiece(piece)
    }

    piece.board = this
    piece.xy = xy
    this.entities.piece[i] = piece
  }

  getPieces() {
    return Object.values(this.entities.piece)
  }

  cacheCoordinates() {
    const BUFFER = 8
    this.W = 100
    this.H = 100
    this._xy2i = {}
    this._i2xy = {}
    _.range(-BUFFER, this.H + BUFFER + 1).forEach(x => (this._xy2i[x] = {}))

    _.range(-BUFFER, this.W + BUFFER + 1).forEach(x => {
      _.range(-BUFFER, this.H + BUFFER + 1).forEach(y => {
        const i = (this._xy2i[x][y] = x + y * this.W)
        this._i2xy[i] = [x, y]
      })
    })
  }

  reset() {
    if (!this.renderer) {
      this.renderer = new RenderBoard({
        board: this,
      })
    }
    this.entities = {
      square: {}, // it exists!
      wall: {},
      piece: {},
      color: {}, // used in debug only... for now
      path: {}, // path to walk down
      item: {},
    }

    this.rooms = Room.generators.get(this.room_generator)(this)
    this.walls = {}
    this.W = 0
    this.H = 0
    this.rooms.forEach(({ x_max, y_max }) => {
      this.W = Math.max(x_max + 1, this.W)
      this.H = Math.max(y_max + 1, this.H)
    })
    this.cacheCoordinates()
    this.rooms.forEach(({ xys, walls }) => {
      xys.forEach(xy => this.setOne('square', xy, true))
      walls.forEach(xy => this.setOne('wall', xy, 1))
    })
    Room.connectRooms(this)
    //this.resetDialog()
    this.item_generators.forEach(name => {
      Item.generators.get(name)(this)
    })
  }

  listPieces() {
    // used only in debugging from console
    return Object.values(this.entities.piece)
  }

  newPiece(opts) {
    const piece = newPiece(opts)
    piece._turn = this.game.turn
    this.setPiece(piece.xy, piece)
    return piece
  }

  removePiece(piece) {
    delete this.entities.piece[this.xy2i(piece.xy)]
    this.renderer.removePiece(piece)
  }
}

new APIManager(Board)

export default Board
