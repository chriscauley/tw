import uR from 'unrest.io'

const { List } = uR.db

export default class BasePiece extends uR.db.Model {
  static slug = 'piece.BasePiece'
  static fields = {
    xy: List(0),
    dxy: List(0, { initial: [0, 1] }),
  }

  constructor(opts) {
    super(opts)
    const square = opts.board.getSquare(this.xy)
    square && square.addPiece(this)
  }
}
