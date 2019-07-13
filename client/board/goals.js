import { randomPiece } from '../piece/generator'

const noPieces = ({ board }) =>
  !board.getPieces().find(piece => piece.team === 0)

const spawnIfNoPieces = game => {
  if (noPieces(game)) {
    spawnBoardPieces(game)
  }
}

const spawnBoardPieces = game => {
  const { board } = game
  randomPiece(board, 5, ['walker'])
}

const preps = {
  'kill-all': spawnBoardPieces,
}

const ticks = {
  'touch-tiles': spawnIfNoPieces,
}

const checks = {
  'kill-all': noPieces,
}

export default {
  check: game => {
    const name = game.victory_condition
    return checks[name] && checks[name](game)
  },
  prep: game => {
    const name = game.victory_condition
    preps[name] && preps[name](game)
  },
  tick: game => {
    const name = game.victory_condition
    ticks[name] && ticks[name](game)
  },
}
