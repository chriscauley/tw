import geo from '../geo'
import piece_controller from '../piece/system'

const forward = (piece, move, dxy = piece.dxy) => {
  // move forward up to piece.speed squraes
  // if an enemy is in the way, attack that enemy
  const dxys = geo.look.line[dxy][piece.speed]
  const squares = geo.look.lookMany(piece.square, dxys)

  squares.find(square => {
    // update move until a square is blocked
    if (piece_controller.canAttackSquare(piece, square)) {
      move = {
        ...move,
        damage: { squares: [square], count: piece.damage },
        dxy: dxy,
        done: true,
      }
    }

    if (!piece_controller.canMoveOn(piece, square, dxy)) {
      // can't move onto square, continue
      return move
    }

    // square is open, modify move to move ont square
    // return nothing to check next square
    move = {
      ...move,
      move_to: square,
      dxy: dxy,
      done: true,
    }
  })
  return move
}

export default forward

// clone because it gets reshuffled
const dxy_list = [...geo.dxy.list]

export const forwardRandomly = (piece, move = {}) => {
  // #! TODO piece currently doesn't have random
  // randomness will probably be handled by composition, not inheritance
  for (const dxy of piece.random.shuffle(dxy_list)) {
    move = forward(piece, move, dxy)
    if (move.done) {
      move.turn = geo.dxy.ZERO
      return move
    }
  }
}
