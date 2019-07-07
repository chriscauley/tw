import move from '../../move'
import boos from './boos'
import blind_mooks from './blind_mooks'

const zeroOut = move.setAfter(
  {
    dxy: [0, 0],
    energy: 0,
  },
  true,
)

export default {
  ...boos,
  ...blind_mooks,
  seeker: {
    sprite: 'skeleton',
    opts: { health: 2 },
    tasks: [
      move
        .energy('health')
        .equals(1)
        .then(move.chain([move.forward.fromHit, move.morph('runner')])),
      move.wait(1),
      move.follow,
    ],
  },
  runner: {
    sprite: 'skeleton-legs',
    opts: { sight: 0 },
    tasks: [move.combineWith('seeker', 'jumper'), move.forward, move.flip],
  },
  drifter: {
    tasks: [move.wait(1), move.follow, move.forwardRandomly],
    sprite: 'bat',
  },
  charger: {
    sprite: 'beholder',
    no_follow: true,
    opts: { sight: 4, dxy: [0, 0], turns: 4 }, // #! TODO Sight should be in target
    tasks: [
      move.energy
        .use(1)
        .chain([
          move.energy.has(1).then(zeroOut),
          move.find([move.ifDidDamage(move.forward, zeroOut), zeroOut]),
        ]),
      move.target(move.energy.add(4)),
    ],
  },

  jumper: {
    tasks: [move.wait(1), move.follow, move.forwardRandomly],
    sprite: 'legsfordays',
    opts: { speed: 2 },
  },
}
