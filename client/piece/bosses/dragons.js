/* Here be dragons */

import move from '../../move'

const dragons = {}

const dragon = (color, spell = move.follow) =>
  (dragons[`${color}dragon`] = {
    sprite: ` sprite1x2-${color}dragon`,
    tasks: [move.wait(1), spell, move.follow],
    opts: { health: 8 },
  })

dragon('blue')
dragon('purple')
dragon('grey')
dragon('red')

export default dragons
