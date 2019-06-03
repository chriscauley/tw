import { range, isEqual } from 'lodash'

import uR from 'unrest.io'
import geo from '../geo'

class AbstractTool extends uR.db.Model {
  static slug = 'none.BaseTool'
  static opts = {
    layer: uR.REQUIRED,
    default_value: 1,
  }
  constructor(opts) {
    super(opts)
    this.name = this.layer
  }
  bindBoard(board) {
    this.board = board
  }
  remove(xy) {
    this.board.removeOne(this.layer, xy)
  }
  click(xy, event) {
    // general behavior of all tools
    if (event.shiftKey) {
      return this.remove(xy)
    }
    // all tools need a square, even square
    this.board.setOne('square', xy, 1)
    this._click(xy, event)
  }

  _click(xy, _event) {
    // tool specific click functionality
    // by default it just sets the square value to the default value
    this.board.setOne(this.layer, xy, this.default_value)
  }
}

class BaseTool extends AbstractTool {}

class CycleTool extends AbstractTool {
  static opts = {
    values: geo.dxy.list,
  }
  constructor(opts) {
    super(opts)
    this.state = {}
  }
  bindBoard(board) {
    super.bindBoard(board)
    Object.entries(this.board.entities[this.layer]).forEach(([xy, value1]) => {
      this.state[xy] = this.values.findIndex(value2 => isEqual(value1, value2))
    })
  }
  getNextValue(xy) {
    this.state[xy] = this.state[xy] === undefined ? 0 : this.state[xy] + 1
    return this.values[this.state[xy] % this.values.length]
  }
  remove(xy) {
    super.remove(xy)
    delete this.state[xy]
  }
  _click(xy, _event) {
    this.board.setOne(this.layer, xy, this.getNextValue(xy))
  }
}

class PieceTool extends CycleTool {
  static opts = {
    layer: 'piece',
    type: uR.REQUIRED,
  }
  _click(xy, _event) {
    const piece = this.board.getOne('piece', xy)
    if (piece) {
      piece.dxy = this.getNextValue(xy)
    } else {
      this.board.newPiece({
        xy,
        type: this.type,
        dxy: this.getNextValue(xy),
      })
    }
  }
  bindBoard(board) {
    // doesn't call super because we're actually cycling piece.dxy
    this.board = board
    Object.entries(this.board.entities[this.layer]).forEach(([xy, value1]) => {
      this.state[xy] = this.values.findIndex(value2 => isEqual(value1, value2))
    })
  }
}

export default [
  new BaseTool({
    layer: 'square',
  }),

  new BaseTool({
    layer: 'wall',
  }),

  new CycleTool({
    layer: 'floor_dxy',
    values: geo.dxy.list,
  }),

  new CycleTool({
    layer: 'ash',
    values: range(1, 9),
  }),

  new PieceTool({
    type: 'spitter',
  }),

  /*{
    name: 'room',
    click: (xy, board) => {
      start_xy = xy
      end_xy = undefined
    },
    drag: (xy, board) => {
      end_xy = xy
      const [x0, y0] = start_xy
      const [x1, y1] = end_xy
      range(y0,y1+1).forEach( y => {
        range(x0,x1+1).forEach( x => {
          board.renderer.animations.push({xy: [x,y], sprite: 'red'})
        })
      })
    },
  },*/
]
