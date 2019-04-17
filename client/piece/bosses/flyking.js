import move from '../../move'

const summonSome = (geometry, count) => {
  return move.summon({
    types: ['fly'],
    geometry,
    range: 2,
    count,
  })
}
const summonFew = summonSome('_lrfb', 2)
const summonMany = summonSome('_lrfb')

const defendOrAttack = move.switch.health({
  low: move.follow,
  medium: move.forward.random, //#! TODO move.forward.defend,
  high: move.forward.random,
})

const ultimate = move.energy('ultimate')

const tasks = [
  move.ifHit(move.chain([ultimate.add(1), move.teleport(4)])),
  ultimate.use(1).then(summonMany),
  move.wait(1),
  move.energy.use(4).then(summonFew),
  move.chain([
    move.energy.add(1),
    move.find([move.forward.attackNearby, defendOrAttack]),
  ]),
]

export default {
  sprite: 'flyking',
  tasks,
  opts: { health: 8 },
  /*paints: [
    move.energy.has(8).then(
      getGeometry(
  ]*/
}
