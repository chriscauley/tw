import geo from '../geo'

const _isEnemy = (piece, target) => target.team !== piece.team

const _canStillFollow = (piece, target, match) => {
  if (target && match(piece, target)) {
    // pieces can see sight+loss_sight before losing a target
    if (
      geo.vector.getDistance(piece.xy, target.xy) >
      piece.sight + piece.loss_sight
    ) {
      // target is out of sight, stop following
      piece.following = undefined
    } else {
      // keep following
      return true
    }
  }
}

export default pieces => {
  // pieces without sight cannot see
  pieces = pieces.filter(p => p.sight)

  // order is useful in optimizing performance as it tracks iterations of follow
  // currently not in use anywhere
  pieces.forEach(p => (p.follow_order = undefined))

  // track who is and isn't following
  const is_following = {}
  const could_follow = {}
  let needs_following = pieces.filter(piece => {
    const target = piece.following
    if (_canStillFollow(piece, target, _isEnemy)) {
      is_following[piece.id] = true
      return false
    }
    return true
  })

  // find and follow enemy, mark non-enemies as "could follow"
  needs_following = needs_following.filter(piece => {
    const dxys = geo.look.circle['1,0'][piece.sight] // should accomodate cross
    const xys = geo.look.lookMany(piece.xy, dxys)
    const target_pieces = piece.board.getMany('piece', xys)

    // these should be sorted by proximity, follow nearest enemy
    const enemy = target_pieces.find(target => _isEnemy(piece, target))
    if (enemy) {
      is_following[piece.id] = true
      piece.following = enemy
      return false
    }
    could_follow[piece.id] = target_pieces
    return true
  })

  // match all pieces with the pieces using could_follow and is_following
  let remaining = 0
  let order = 0
  while (remaining !== needs_following.length) {
    remaining = needs_following.length
    needs_following = needs_following.filter(piece => {
      const target = could_follow[piece.id].find(
        target => is_following[target.id],
      )
      if (target) {
        is_following[piece.id] = true
        piece.following = target
        piece.follow_order = order
        return false
      }
      return true
    })
    order++
  }
  needs_following.forEach(p => (p.following = undefined))
}
