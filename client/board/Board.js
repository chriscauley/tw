// Shared functionality for board and room
import _ from 'lodash'
import uR from 'unrest.io'
import Random from 'ur-random'

import { newPiece } from '../piece/entity'

const { Int, Model } = uR.db

export default class extends Random.Mixin(Model) {
  static slug = 'board.Board'
  static fields = {
    W: Int(0),
    H: Int(0),
  }
  static opts = {
    room_generator: undefined,
  }
  i2xy = i => [i % this.W, Math.floor(i / this.W)]
  xy2i = ([x, y]) => x + y * this.W

  constructor(opts) {
    super(opts)
    this.W = 20 //this.W || this.random.int(10)
    this.H = 20 //this.W || this.random.int(10)

    this.reset()
  }

  getOne = (type, xy) => {
    if (!_.inRange(xy[0], 0, this.W) || !_.inRange(xy[1], 0, this.H)) {
      return undefined
    }
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

  reset() {
    this.entities = {
      square: {}, // it exists!
      wall: {},
      piece: {},
      color: {}, // used in debug only... for now
    }

    const rooms = this.room_generator({})
    this.pieces = {}
    this.walls = {}
    this.W = 0
    this.H = 0
    rooms.forEach(({ x_max, y_max }) => {
      this.W = Math.max(x_max + 1, this.W)
      this.H = Math.max(y_max + 1, this.H)
    })
    rooms.forEach(({ xys, walls }) => {
      xys.forEach(xy => this.setOne('square', xy, true))
      walls.forEach(xy => this.setOne('wall', xy, 1))
    })
  }

  newPiece(opts) {
    const piece = newPiece(opts)
    this.setPiece(piece.xy, piece)
  }

  removePiece(piece) {
    delete this.entities.piece[this.xy2i(piece.xy)]
    this.renderer.removePiece(piece)
  }
}
