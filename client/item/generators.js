import { randomEmptyXY } from '../lib'
import weapon from './weapon'

const randomWeapon = board => {
  const room = board.random.choice(board.rooms)

  board.setOne(
    'item',
    randomEmptyXY(board, room.xys),
    weapon.types.get('scythe'),
  )
}

export default new Map([['randomWeapon', randomWeapon]])
