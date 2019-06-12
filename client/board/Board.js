// Shared functionality for board and room
import _ from 'lodash'
import uR from 'unrest.io'
import Random from 'ur-random'

import Room from './Room'
import Item from '../item'
import DialogMixin from './dialog'
import geo from '../geo'
import { newPiece } from '../piece/entity'
import types from '../piece/types'
import { RenderBoard } from '../render/html'
import move from '../move'
import { applyMove } from '../piece/lib'
const { Model, APIManager, List, Int, String, Field } = uR.db

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
    _entities: Field({}),
  }
  __str__() {
    return this.name
  }
  i2xy = i => this._i2xy[i]
  xy2i = xy => this._xy2i[xy[0]][xy[1]]

  constructor(opts) {
    super(opts)
    this.MAX_ASH = this.MAX_ASH || 8
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

  removeOne(type, xy) {
    delete this.entities[type][this.xy2i(xy)]
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

  addFire(value, xy, dxy, state = this.entities) {
    const i = this.xy2i(xy)
    const { fire, dxy_fire } = state
    if (fire[i]) {
      fire[i] += value
      dxy_fire[i] = geo.vector.sign(geo.vector.add(dxy_fire[i], dxy))
    } else {
      fire[i] = value
      dxy_fire[i] = dxy
    }
  }

  cacheCoordinates() {
    this.W = 100
    this.H = 100
    this._xy2i = {}
    this._i2xy = {}

    // "overflow", so that getting this.xy2i for an out of bounds x
    // does not throw an error
    _.range(-this.H * 2, 2 * this.H + 1).forEach(x => (this._xy2i[x] = {}))

    _.range(-this.W, this.W + 1).forEach(x => {
      _.range(-this.H, this.H + 1).forEach(y => {
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
      fire: {},
      dxy_fire: {},
      ash: {},
      gold: {},
      floor_dxy: {}, // arrow tiles
      room: {},
    }

    this.rooms = Room.generators.get(this.room_generator)(this)
    if (this._entities && this._entities.piece) {
      Object.assign(this.entities, this._entities)
      this.cacheCoordinates()
      Object.values(this._entities.piece).forEach(piece => {
        this.setOne('piece', piece.xy, undefined)
        this.newPiece(piece)
      })
      return
    }
    this.walls = {}
    this.W = 0
    this.H = 0
    this.rooms.forEach(({ x_max, y_max }) => {
      this.W = Math.max(x_max + 1, this.W)
      this.H = Math.max(y_max + 1, this.H)
    })
    this.cacheCoordinates()
    this.rooms.forEach(({ xys, walls }) => {
      xys.forEach(xy => this.setOne('square', xy, 1))
      walls.forEach(xy => this.setOne('wall', xy, 1))
    })
    Room.connectRooms(this)
    //this.resetDialog()
    this.item_generators.forEach(name => {
      Item.generators.get(name)(this)
    })
  }

  regenerateRooms() {
    const max_range = 5
    const used_ranges = {}
    this.entities.square = {}
    this.entities.wall = {}
    Object.keys(this.entities.room).forEach(i => {
      const xy = this.i2xy(i)
      this.entities.square[i] = 1
      used_ranges[xy] = -1
    })
    _.range(1, max_range).forEach(range => {
      Object.keys(this.entities.room).forEach(i => {
        const xy = this.i2xy(i)
        geo.look._square['0,1'][range].forEach(dxy => {
          const target_xy = geo.vector.add(xy, dxy)
          if (used_ranges[target_xy]) {
            if (range - used_ranges[target_xy] < 2) {
              this.setOne('wall', target_xy, 1)
            }
          } else {
            this.setOne('square', target_xy, 1)
            used_ranges[target_xy] = range
          }
        })
      })
    })
    Object.keys(this.entities.room).forEach(i => {
      const xy = this.i2xy(i)
      geo.look._square['0,1'][max_range].forEach(dxy => {
        const target_xy = geo.vector.add(xy, dxy)
        if (!this.getOne('square', target_xy)) {
          this.setOne('wall', target_xy, 1)
        }
        if (max_range - used_ranges[target_xy] < 2) {
          this.setOne('wall', target_xy, 1)
        }
      })
    })
    this.renderer.update()
  }

  listPieces() {
    // used only in debugging from console
    return Object.values(this.entities.piece)
  }

  newPiece(opts) {
    opts._PRNG = opts._PRNG || this.random.int()
    const piece = newPiece(opts)
    piece._turn = this.game.turn
    this.setPiece(piece.xy, piece)
    return piece
  }

  canAddFire = xy => !this.getOne('wall', xy) && this.getOne('square', xy)
  _addAsh = (old_index, value) =>
    (this.entities.ash[old_index] = (this.entities.ash[old_index] || 0) + value)
  _addGold = (old_index, value) =>
    (this.entities.gold[old_index] =
      (this.entities.gold[old_index] || 0) + value)

  moveFire() {
    const new_state = {
      fire: {},
      dxy_fire: {},
    }
    Object.entries(this.entities.fire).forEach(([old_index, value]) => {
      const dxy = this.entities.dxy_fire[old_index]
      const xy = geo.vector.add(this.i2xy(old_index), dxy)
      if (!this.canAddFire(xy)) {
        this._addAsh(old_index, 1)
      } else {
        this.addFire(value, xy, dxy, new_state)
      }
    })
    Object.assign(this.entities, new_state)
  }

  resolveAsh() {
    Object.keys(this.entities.ash).forEach(index => {
      const value = this.entities.ash[index]
      if (value > this.MAX_ASH) {
        const xy = this.i2xy(index)
        if (!this.entities.piece[index]) {
          this.entities.ash[index]--
          this.newPiece({
            xy,
            type: 'pot',
          })
        }
      }
    })
  }

  isGoldOverThreshold() {
    const values = Object.values(this.entities.gold)
    const total = _.sum(values)
    this.GOLD_THRESHOLD = 2 // #! TODO
    return total >= this.GOLD_THRESHOLD
  }

  consumeGold() {
    const entries = Object.entries(this.entities.gold)
    if (this.isGoldOverThreshold()) {
      entries.forEach(entry => {
        if (!this.entities.piece[entry[0]]) {
          this.newPiece({
            xy: this.i2xy(entry[0]),
            type: 'pot',
          })
        }
      })
    } else {
      entries.forEach(entry => {
        this._addAsh(entry[0], entry[1])
      })
    }
    this.entities.gold = {}
  }

  applyFire() {
    // this function gets applied 3 times a turn! Make as efficient as possible
    // 1. before moving fire (in case piee moved into fire)
    // 2. after moving fire (collide moved fire with stationary pieces)
    // 3. after moving pieces (collide moved pieces with stationary fire)
    const { fire, dxy_fire, piece } = this.entities
    Object.entries(fire).forEach(([i, value]) => {
      const xy = this.i2xy(i)
      const dxy = dxy_fire[i]
      if (piece[i]) {
        console.log("TODO collide piece with fire",value,xy,dxy) // eslint-disable-line
        delete fire[i]
      }
    })
  }

  applyFloor() {
    // #! TODO apply to pieces as well
    const { floor_dxy, fire, piece } = this.entities
    Object.entries(floor_dxy).forEach(([index, dxy]) => {
      if (fire[index]) {
        // #! TODO this is copypasta from moveFire
        const xy = geo.vector.add(this.i2xy(index), dxy)
        if (!this.canAddFire(xy)) {
          // #! TODO drop ash
          return
        }
        this.addFire(fire[index], xy, dxy)
        delete fire[index]
      }
      if (piece[index]) {
        const _move = move.forward(piece[index], {}, dxy)
        applyMove(piece[index], _move)
      }
    })
  }

  removePiece(piece) {
    delete this.entities.piece[this.xy2i(piece.xy)]
    this.renderer.removePiece(piece)
  }

  serialize(keys) {
    const out = super.serialize(keys)
    out._entities = JSON.parse(
      JSON.stringify(this.entities, (key, value) => {
        if (key === 'board' || key === '_type') {
          return
        }
        return value
      }),
    )
    return out
  }
}

new APIManager(Board)

export default Board
