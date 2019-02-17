import vector from '../geo/vector'
import _ from 'lodash'

const addMoves = (...moves) => {
  // add all moves together to make one big move
  const dxys = moves.map(move => move.dxy).filter(dxy => dxy)
  return {
    dxy: vector.sum(dxys),
    move_to: _.reverse(moves).find(m => m.move_to),
  }
}

const getMove = (player, dxy) => {
  return {
    dxy,
    move_to: player.board.getSquare(vector.add(player.xy, dxy)),
  }
}

const applyMove = (player, { dxy, move_to }) => {
  if (move_to) {
    move_to.addPiece(player)
  }
  player.dxy = dxy || player.dxy
}

const move = (player, { dxy, shiftKey, _ctrlKey }) => {
  let move = getMove(player, dxy)

  applyMove(player, move)
  if (shiftKey) {
    const move2 = getMove(player, dxy)
    applyMove(player, move2)
    move = addMoves(move, move2)
  }
  return move
}

export { move }
