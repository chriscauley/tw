import move from '../../move'

export default {
  boo: {
    sprite: 'wisp',
    tasks: [move.ifLookedAt(move.booOff), move.follow],
  },
  bootoo: {
    sprite: 'shade',
    opts: { turns: 2 },
    tasks: [move.ifLookedAt(move.booOff), move.follow],
  },
  boohoo: {
    sprite: 'wraith',
    opts: { turns: 3, health: 3, sight: 5 },
    tasks: [
      move.ifHit(move.teleport(4)),
      move.ifLookedAt(move.booOff),
      move.follow,
    ],
  },
}
