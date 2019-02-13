// Shared functionality for board and room
import _ from 'lodash'
import uR from 'unrest.io'

import Square from './Square'

const { Int, Model, List } = uR.db

export default class extends Model {
  static slug = "board.BaseBoard"
  static fields = {
    W: Int(10),
    H: Int(10),
    squares: List(Square),
  }
  constructor(opts) {
    super(opts)
    this.reset()
  }
  getSquare([x,y]) {
    if (x < 0 || x >= this.W) { return undefined }
    return this.squares[x + y*this.W]
  }
  reset() {
    this.rows = _.range(this.H).map(y=> (
      _.range(this.W).map(x => (
        new Square({ x, y, board: this})
      ))
    ))
    this.squares = _.concat(...this.rows)
    this.pieces = []
  }
  serializeRows() {
    return this.rows.map(row => (
      row.map( square => {
        const { x, y, color } = square
        return {
          text: `${x},${y}`,
          className: `cell ${color}`
        }
      })
    ))
  }
}