// Shared functionality for board and room
import _ from 'lodash'
import uR from 'unrest.io'
import Random from 'ur-random'

import Square from './Square'
import { newPiece } from '../piece/entity'

const { Int, Model, List } = uR.db

export default class extends Random.Mixin(Model) {
  static slug = 'board.Board'
  static fields = {
    W: Int(0),
    H: Int(0),
    squares: List(Square),
  }
  constructor(opts) {
    super(opts)
    this.W = this.W || this.random.int(10)
    this.H = this.H || this.random.int(10)
    this.reset()
  }
  getSquare([x, y]) {
    if (x < 0 || x >= this.W) {
      return undefined
    }
    return this.squares[x + y * this.W]
  }
  getSquares(xys) {
    return xys.map(xy => this.getSquare(xy)).filter(s => s)
  }
  reset() {
    this.rows = _.range(this.H).map(y =>
      _.range(this.W).map(x => new Square({ xy: [x, y], board: this })),
    )
    this.squares = _.concat(...this.rows)
    this.pieces = []
  }

  addPiece(piece) {
    if (piece.board === this) {
      return // idempotent
    }
    if (piece.board) {
      piece.board.removePiece(piece)
    }
    piece.board = this
    this.pieces.push(piece)
  }

  newPiece(opts) {
    const piece = newPiece(opts)
    this.getSquare(piece.xy).addPiece(piece)
  }

  removePiece(piece) {
    _.remove(this.pieces, piece)
    this.renderer.removePiece(piece)
  }
}
