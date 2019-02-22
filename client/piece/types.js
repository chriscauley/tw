import move from '../move'

const type_map = {
  walker: {
    short: 'w',
    sprite: 'zombie',
    tasks: [move.wait(1), move.forward, move.flip],
  },
  seeker: {
    short: 's',
    sprite: 'skeleton',
    tasks: [move.findEnemy, move.wait(1), move.follow],
  },
  drifter: {
    tasks: [move.wait(1), move.attackNearby, move.forwardRandomly],
    short: 'd',
    sprite: 'bat',
  },
  bouncer: {
    tasks: [move.cycle(move.flip, move.forward)],
    short: 'b',
    sprite: 'blueblob',
  },
  charger: {
    tasks: [move.target(move.forward, { reset_look: true })],
    short: 'c',
    sprite: 'beholder',
    opts: { sight: 4, speed: 4, dxy: [0, 0] },
  },
}

type_map.names = Object.keys(type_map)
type_map.short2type = {}
type_map.names.forEach(name => {
  const type = type_map[name]
  type_map.short2type[type.short] = name
})

type_map.player = {
  sprite: 'warrior',
}

export default type_map
