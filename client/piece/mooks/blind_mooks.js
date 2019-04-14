/* pieces that don't use follow */

import move from '../../move'

const opts = { sight: 0 }

export default {
  walker: {
    sprite: 'zombie',
    opts,
    tasks: [move.wait(1), move.forward, move.flip],
  },
  bouncer: {
    tasks: [move.cycle(move.flip, move.forward)],
    opts,
    sprite: 'blueslime',
  },
  spitter: {
    sprite: 'o-eye',
    opts,
    tasks: [move.shoot('fireball')],
  },
  pentagram: {
    sprite: 'pentagram',
    opts: { sight: 0, invulnerable: true },
    tasks: [move.ifHit(move.shoot('fireball'))],
  },
  fly: {
    sprite: 'fly',
    opts,
    tasks: [move.forward, move.forward.turnOrFlip],
  },
}
