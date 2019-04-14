import move from '../../move'
import boos from './boos'
import blind_mooks from './blind_mooks'

export default {
  ...boos,
  ...blind_mooks,
  seeker: {
    sprite: 'skeleton',
    tasks: [move.wait(1), move.follow],
  },
  drifter: {
    tasks: [move.wait(1), move.follow, move.forwardRandomly],
    sprite: 'bat',
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
}
