import BasePiece from './BasePiece'
import vector from '../geo/vector'


export default class Player extends BasePiece {
  getMove({ dxy, shift, control }) {
    return {
      dxy,
      move_to: this.board.getSquare(vector.add(this.xy,dxy))
    }
  }
  applyMove({ dxy = this.dxy, move_to }) {
    if (move_to) {
      move_to.addPiece(this)
    }
    this.dxy = dxy
  }
}