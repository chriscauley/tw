import vector from '../geo/vector'
import _ from 'lodash'
import control from './system'

const addMoves = (...moves) => {
  // add all moves together to make one big move
  const dxys = moves.map(move => move.dxy).filter(dxy => dxy)
  return {
    dxy: vector.sum(dxys),
    xy: _.reverse(moves).find(m => m.xy), // use last xy
  }
}

const getMove = (player, dxy) => {
  let xy = vector.add(player.xy, dxy)
  if (!control.canMoveOn(player, player.board.getSquare(xy))) {
    xy = undefined
  }
  return {
    dxy,
    xy,
  }
}

const move = (player, { dxy, shiftKey, _ctrlKey }) => {
  let move = getMove(player, dxy)

  control.applyMove(player, move)
  if (shiftKey) {
    const move2 = getMove(player, dxy)
    control.applyMove(player, move2)
    move = addMoves(move, move2)
  }
  return move
}

export { move }
