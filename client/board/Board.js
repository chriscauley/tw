// Shared functionality for board and room
import _ from 'lodash'
import uR from 'unrest.io'
import Random from 'ur-random'

import Room from './Room'
import Item from '../item'
import DialogMixin from './dialog'
import geo from '../geo'
import { newPiece } from '../piece/entity'
import { RenderBoard } from '../render/html'
import move from '../move'
import { applyMove } from '../piece/lib'
const { Model, APIManager, List, Int, String, Field } = uR.db
import { TestResult } from '../uc'

// javascript's % is remainder, not modulus
const mod = (n, m) => ((n % m) + m) % m

export const getEmptyEntities = () => {
  return {
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
}

class Board extends DialogMixin(Random.Mixin(Model)) {
  static slug = 'server.Board'
  static editable_fieldnames = ['name', 'W', 'H']
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
    _entities: Field(undefined),
    W: Int(100),
    H: Int(100),
  }
  __str__() {
    return this.name
  }
  i2xy = i => this._i2xy[mod(i, this.LENGTH)]
  xy2i = xy => mod(xy[0] + xy[1] * this.W, this.LENGTH)
  dxy2dindex = dxy => dxy[0] + this.W * dxy[1]

  constructor(opts) {
    super(opts)
    this.MAX_ASH = this.MAX_ASH || 8
    this._entities = {
      ...getEmptyEntities(),
      ...this._entities,
    }

    // these methods are identical to their Board.XXX counterparts
    // but they modify the core _entities of the board
    this._ = {
      getOne: (type, xy) => this._entities[type][this.xy2i(xy)],
      setOne: (type, xy, obj) => {
        this.entities[type][this.xy2i(xy)] = obj
        this._entities[type][this.xy2i(xy)] = obj
      },
      removeOne: (type, xy) => {
        delete this.entities[type][this.xy2i(xy)]
        delete this._entities[type][this.xy2i(xy)]
      },
      newPiece: opts => {
        opts._PRNG = opts._PRNG || this.random.int()
        const piece = newPiece(opts)
        piece._turn = this.game.turn
        this.setPiece(piece.xy, piece)
        this._.setOne('piece', piece.xy, piece)
        return piece
      },
    }
  }

  setPlayer = player => {
    // sets the board is now set to the players perspective
    this.player = player
    player.id = ++this._piece_id
    this.setPiece(player.xy, player)
    this.renderer.redraw(true)
  }

  getOne = (type, xy) => {
    return this.entities[type][this.xy2i(xy)]
  }

  getMany(type, xys) {
    return xys.map(xy => this.getOne(type, xy)).filter(i => i !== undefined)
  }

  setOne(type, xy, obj) {
    this.entities[type][this.xy2i(xy)] = obj
  }

  removeOne(type, xy) {
    delete this.entities[type][this.xy2i(xy)]
  }

  setPiece(xy, piece) {
    const index = this.xy2i(xy)
    xy = this.i2xy(index)

    const old = this.entities.piece[index]
    if (old && old !== piece) {
      throw 'Pauli Exclusion error'
    }

    if (piece.xy && piece.board) {
      // remove from old position
      piece.board.removePiece(piece)
    }

    piece.board = this
    piece.xy = xy
    piece.index = index
    this.entities.piece[index] = piece
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
    this._i2xy = {}
    this.LENGTH = this.W * this.H

    _.range(0, this.W).forEach(x => {
      _.range(0, this.H).forEach(y => {
        const i = this.xy2i([x, y])
        this._i2xy[i] = [x, y]
      })
    })
    this.MIN_X = 0
    this.MIN_Y = 0
    this.MAX_X = this.W
    this.MAX_Y = this.H
  }

  reset() {
    this.entities = {
      ...getEmptyEntities(),
      ..._.cloneDeep(this._entities),
    }
    this._piece_id = 0
    this.cacheCoordinates()
    this._regenerateRooms()
    Object.values(this._entities.piece).forEach(piece => {
      this.setOne('piece', piece.xy, undefined)
      this.newPiece(piece)
    })

    if (!this.renderer) {
      this.renderer = new RenderBoard({
        board: this,
      })
    }

    TestResult.validate({
      params: { board_id: this.id, state: 'reset' },
      results: this.getCurrentState(),
    })
  }

  getCenter() {
    return this.W === 100
      ? [12, 12]
      : [Math.floor(this.W / 2), Math.floor(this.H / 2)]
  }

  _regenerateRooms() {
    const max_range = 4
    const used_ranges = {}

    Object.keys(this.entities.square)
      .map(Number)
      .forEach(index => {
        used_ranges[index] = -2
      })

    Object.keys(this.entities.room)
      .map(Number)
      .forEach(index => {
        // mark the center of each room as belonging to it
        this.entities.square[index] = 1
        used_ranges[index] = -1
      })

    const getOpenIndexes = (center_index, dindexes) => {
      return dindexes
        .map(dindex => {
          const target_index = dindex + center_index
          this.entities.square[target_index] = 1
          return target_index
        })
        .filter(ti => ti !== undefined)
    }

    _.range(1, max_range + 1).forEach(range => {
      const dindexes = geo.look._square['0,1'][range].map(this.dxy2dindex)
      Object.keys(this.entities.room)
        .map(Number)
        .forEach(center_index => {
          getOpenIndexes(center_index, dindexes).forEach(target_index => {
            if (!used_ranges[target_index]) {
              // square hasn't been used before, mark it as used
              used_ranges[target_index] = range
              if (range === max_range) {
                this.entities.wall[target_index] = 1
              }
            } else if (range - used_ranges[target_index] < 2) {
              // square has been used but is close enough to be a wall
              this.entities.wall[target_index] = 1
            }
          })
        })
    })
  }

  listPieces() {
    // used only in debugging from console
    return Object.values(this.entities.piece)
  }

  newPiece(opts) {
    opts._PRNG = opts._PRNG || this.random.int()
    const piece = newPiece(opts)
    piece.id = ++this._piece_id
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
            type: 'seeker',
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

  resolveFloor() {
    // #! TODO apply to pieces as well
    const { floor_dxy, fire, piece } = this.entities
    const dirty = {
      ash: [],
      piece: [],
      fire: [],
    }

    // move pieces or fire on floor_dxy
    Object.entries(floor_dxy).forEach(([index, dxy]) => {
      if (fire[index]) {
        // #! TODO this is copypasta from moveFire
        const new_xy = geo.vector.add(this.i2xy(index), dxy)
        if (!this.canAddFire(new_xy)) {
          // #! TODO drop ash
          return
        }
        this.addFire(fire[index], new_xy, dxy)
        delete fire[index]
        dirty.fire.push(new_xy)
      }
      if (piece[index]) {
        const target_piece = piece[index]
        const _move = move.forward(target_piece, {}, dxy)
        if (_move.done) {
          applyMove(target_piece, _move)
          dirty.piece.push(target_piece.xy)
        }
      }
    })

    this.applyFire()

    // onto the ash
    Object.keys(this.entities.ash).forEach(index => {
      const value = this.entities.ash[index]
      if (value > this.MAX_ASH) {
        const xy = this.i2xy(index)
        if (!this.entities.piece[index]) {
          dirty.ash.push(xy)
          dirty.piece.push(xy)
          this.entities.ash[index]--
          this.newPiece({
            xy,
            type: 'seeker',
          })
        }
      }
    })

    return dirty
  }

  removePiece(piece) {
    delete this.entities.piece[this.xy2i(piece.xy)]
    this.renderer.removePiece(piece)
  }

  _sanitize(data) {
    // this.entities has keys
    data = _.cloneDeep(data)
    data.piece &&
      Object.values(data.piece).forEach(piece => {
        // need to remove board and type because they are shortcut references
        delete piece.board
        delete piece._type
      })
    return data
  }

  getCurrentState() {
    return this._sanitize(this.entities)
  }

  serialize(keys) {
    // #! TODO this may be unecessary since Board.fields uses _entities
    // which has no circular references
    return this._sanitize(super.serialize(keys))
  }
}

new APIManager(Board)

export default Board
