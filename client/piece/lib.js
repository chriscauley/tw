import types from './types'
import { applyBuff } from '../move/buff'

export const getMove = piece => {
  let move = applyBuff(piece, {})
  if (move.done) {
    return move
  }
  types[piece.type].tasks.find(task => {
    move = task(piece, move)
    if (move && move.done) {
      return move
    }
  })

  return move
}

export const applyMove = (piece, move, turn) => {
  if (piece.preMove) {
    piece.preMove()
  }
  const { xy, dxy = piece.dxy, damages, after = [], preMove } = move
  if (damages && damages.length) {
    damages.forEach(damage => {
      damage.turn = turn
      const target = piece.board.getOne('piece', damage.xy)
      applyDamage(target, damage)
      target._last_damage = damage
    })
  }
  if (xy && xy !== piece.xy) {
    piece.board.setPiece(xy, piece)
  }
  piece.dxy = dxy
  after.forEach(f => piece.board.game.one('nextturn', () => f(piece, move)))
  piece.last_move = move
  piece.preMove = preMove
  piece._turn = turn // indicates this moved this turn
  if (move.now) {
    move.now(piece)
  }
}

export const applyDamage = (piece, { count, xy, dxy, sprite, source }) => {
  piece.health -= count
  if (!sprite) {
    sprite = types[source.type].damage_animation || source.type
  }
  piece.board.renderer.animations.push({ xy, dxy, sprite, className: 'fade' })
  if (piece.health <= 0) {
    // #! TODO should also do death animation
    piece.dead = true
    piece.board.removePiece(piece)
  }
}

export const canAttack = (piece, xy) => {
  const target = piece.board.getOne('piece', xy)
  if (!target || target.invulnerable) {
    return
  }
  return target.team !== piece.team || types[piece.type].friendly_fire
}

export const canMoveOn = (piece, xy, _dxy) => {
  const { getOne } = piece.board
  return getOne('square', xy) && !getOne('piece', xy) && !getOne('wall', xy)
}

export const friendFoeOrEmpty = (piece, xy, _dxy) => {
  const { getOne } = piece.board
  if (getOne('piece', xy)) {
    return true
  }
  return getOne('square', xy) && !getOne('wall', xy)
}

const _respawn = {}

export const respawn = player => {
  const { id, xy, dxy, team, board } = player
  if (!_respawn[id]) {
    board.removePiece(player)
    _respawn[id] = board.newPiece({
      type: 'respawn',
      team,
      xy,
      dxy,
    })
    _respawn[id].spawns = player
    _respawn[id].remove = () => (_respawn[id] = undefined)
    player.lives--
    player.health = player.max_health
    board.game.ui.update()
  }
}
