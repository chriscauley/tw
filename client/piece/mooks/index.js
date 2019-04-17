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
    tasks: [move.wait(1), move.follow],
  },
  drifter: {
    tasks: [move.wait(1), move.follow, move.forwardRandomly],
    sprite: 'bat',
  },
  charger: {
    sprite: 'beholder',
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
    sprite: 'goblin',
    opts: { speed: 2 },
  },
}
