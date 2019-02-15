import BasePiece from './BasePiece'
import vector from '../geo/vector'
import _ from 'lodash'

const addMoves = (...moves) => {
  // add all moves together to make one big move
  const dxys = moves.map(move => move.dxy).filter(dxy => dxy)
  return {
    dxy: vector.sum(dxys),
    move_to: _.reverse(moves).find(m => m.move_to)
  }
}

export default class Player extends BasePiece {
  getMove(dxy) {
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

  move({ dxy, shiftKey, _ctrlKey }) {
    let move = this.getMove(dxy)

    this.applyMove(move)
    if (shiftKey) {
      const move2 = this.getMove(dxy)
      this.applyMove(move2)
      move = addMoves(move,move2)
    }
    return move
  }
}