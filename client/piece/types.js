import balls from './balls'
import mooks from './mooks'
import bosses from './bosses'

const boss_map = new Map(Object.entries(bosses).sort())
const mook_map = new Map(Object.entries(mooks).sort())
const ball_map = new Map(Object.entries(balls).sort())

export default {
  ...balls,
  ...mooks,
  ...bosses,
  boss_map,
  mook_map,
  ball_map,
  player: {
    sprite: 'warrior',
    opts: { health: 4 },
  },
}
