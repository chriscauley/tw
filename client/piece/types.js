import balls from './balls'
import mooks from './mooks'
import bosses from './bosses'

const type_map = {
  ...balls,
  ...mooks,
  ...bosses,
}

type_map.NAMES = Object.keys(type_map)
type_map.NAMES.sort()

type_map.player = {
  sprite: 'warrior',
  opts: { health: 4 },
}

export default type_map
