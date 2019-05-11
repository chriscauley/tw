/* Here be dragons */

import move from '../../move'

const dragons = {}

const dragon = (color, spell_opts, ultimate_opts) =>
  (dragons[`${color}dragon`] = {
    sprite: ` sprite1x2-${color}dragon`,
    tasks: [
      move.ultimate.bounceSummon({
        types: ['fireball_bat'],
        range: 2,
        count: 4,
        ...spell_opts,
        ...ultimate_opts,
      }),

      move.energy.use(4).then(
        move.summon({
          types: ['fireball_bat'],
          range: 2,
          count: 2,
          ...spell_opts,
        }),
      ),

      // #! TODO the following is copied from flyking
      move.wait(1),
      move.chain([
        move.energy.add(1),
        move.find([move.forward.attackNearby, move.follow]),
      ]),
    ],
    opts: { health: 8 },
  })

dragon('grey', { geometry: 'f', range: 1 }, { geometry: '_lrfb', range: 1 })
dragon('blue')
dragon('red', { geometry: 'f', range: 1 }, { recharge: 2 })
dragon('purple', { geometry: 'lr', range: 1 }, { range: 2 })

export default dragons
