import _ from 'lodash'
import move from '../move'
import flyking from './flyking'
import balls from './balls'

const type_map = {
  ...balls,
  flyking, //#! todo needs to be in some kind of boss file
  walker: {
    sprite: 'zombie',
    opts: { sight: 0 },
    tasks: [move.wait(1), move.forward, move.flip],
  },
  seeker: {
    sprite: 'skeleton',
    tasks: [move.wait(1), move.follow],
  },
  bluedragon: {
    sprite: ' sprite1x2-bluedragon',
    tasks: [move.wait(1), move.follow],
    opts: { health: 8 },
  },
  purpledragon: {
    sprite: ' sprite1x2-purpledragon',
    tasks: [move.wait(1), move.follow],
    opts: { health: 8 },
  },
  greydragon: {
    sprite: ' sprite1x2-greydragon',
    tasks: [move.wait(1), move.follow],
    opts: { health: 8 },
  },
  reddragon: {
    sprite: ' sprite1x2-reddragon',
    tasks: [move.wait(1), move.follow],
    opts: { health: 8 },
  },
  drifter: {
    tasks: [move.wait(1), move.follow, move.forwardRandomly],
    sprite: 'bat',
  },
  bouncer: {
    tasks: [move.cycle(move.flip, move.forward)],
    opts: { sight: 0 },
    sprite: 'blueslime',
  },
  charger: {
    tasks: [move.target(move.forward, { reset_look: true })],
    sprite: 'beholder',
    opts: { sight: 4, speed: 4, dxy: [0, 0] },
  },
  jumper: {
    tasks: [move.wait(1), move.follow, move.forwardRandomly],
    sprite: 'goblin',
    opts: { speed: 2 },
  },
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
  spitter: {
    sprite: 'o-eye',
    tasks: [move.shoot('fireball')],
  },
  pentagram: {
    sprite: 'pentagram',
    opts: { invulnerable: true },
    tasks: [move.ifHit(move.shoot('fireball'))],
  },
  fly: {
    sprite: 'fly',
    tasks: [move.forward, move.forward.turnOrFlip],
  },
}

type_map.NAMES = Object.keys(type_map)
type_map.NAMES.sort()

type_map.player = {
  sprite: 'warrior',
  opts: { health: 4 },
}

export default type_map
