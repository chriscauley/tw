import weapon from './weapon'
import generators from './generators'

const default_equipment = {
  weapon: weapon.types.get('knife'),
}

export default {
  default_equipment,
  weapon,
  generators,
}
