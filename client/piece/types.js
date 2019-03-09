import move from '../move'

const type_map = {
  walker: {
    short: 'w',
    sprite: 'zombie',
    opts: { sight: 0 },
    tasks: [move.wait(1), move.forward, move.flip],
  },
  seeker: {
    short: 's',
    sprite: 'skeleton',
    tasks: [move.wait(1), move.follow],
  },
  bluedragon: {
    short: 'B',
    sprite: ' sprite1x2-bluedragon',
    tasks: [move.wait(1), move.follow],
    opts: { health: 8 },
  },
  purpledragon: {
    short: 'P',
    sprite: ' sprite1x2-purpledragon',
    tasks: [move.wait(1), move.follow],
    opts: { health: 8 },
  },
  greydragon: {
    short: 'G',
    sprite: ' sprite1x2-greydragon',
    tasks: [move.wait(1), move.follow],
    opts: { health: 8 },
  },
  reddragon: {
    short: 'R',
    sprite: ' sprite1x2-reddragon',
    tasks: [move.wait(1), move.follow],
    opts: { health: 8 },
  },
  drifter: {
    tasks: [move.wait(1), move.follow, move.forwardRandomly],
    short: 'd',
    sprite: 'bat',
  },
  bouncer: {
    tasks: [move.cycle(move.flip, move.forward)],
    short: 'b',
    opts: { sight: 0 },
    sprite: 'blueslime',
  },
  charger: {
    tasks: [move.target(move.forward, { reset_look: true })],
    short: 'c',
    sprite: 'beholder',
    opts: { sight: 4, speed: 4, dxy: [0, 0] },
  },
  jumper: {
    tasks: [move.wait(1), move.follow, move.forwardRandomly],
    short: 'j',
    sprite: 'goblin',
    opts: { speed: 2 },
  },
  boo: {
    sprite: 'wisp',
    short: 'u',
    tasks: [move.ifLookedAt(move.booOff), move.doTwice(move.follow)],
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
  opts: { health: 1000 },
}

export default type_map
