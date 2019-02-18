import move from '../move'

const type_map = {
  walker: {
    short: 'w',
    tasks: [move.wait(1), move.forward, move.flip],
  },
  seeker: {
    short: 's',
    tasks: [move.findEnemy, move.wait(1), move.follow],
  },
  drifter: {
    tasks: [move.wait(1), move.attackNearby, move.forwardRandomly],
    short: 'd',
  },
  bouncer: {
    tasks: [move.cycle(move.flip, move.forward)],
    short: 'b',
  },
  charger: {
    tasks: [move.target(move.forward, { reset_look: true })],
    short: 'c',
    opts: { speed: 3, dxy: [0, 0] },
  },
}

type_map.names = Object.keys(type_map)
type_map.short2type = {}
type_map.names.forEach(name => {
  const type = type_map[name]
  type_map.short2type[type.short] = name
})

type_map.player = {}

export default type_map
