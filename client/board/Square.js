import uR from 'unrest.io'

const { Model, List, REQUIRED } = uR.db

export default class Square extends Model {
  static slug = 'board.Square'
  static fields = {
    xy: List(), // #! TODO probably an opt, not a field?
  }

  static opts = {
    board: REQUIRED,
    items: [],
  }

  addPiece(piece) {
    if (this.piece && this.piece !== piece) {
      throw 'PauliException: Two pieces cannot occupy the same square'
    }
    if (piece.square) {
      piece.square.removePiece()
    }
    this.piece = piece
    piece.square = this
    this.board.addPiece(piece) // idempotent
    piece.xy = this.xy.slice()
  }

  removePiece() {
    this.piece = undefined
  }
}
