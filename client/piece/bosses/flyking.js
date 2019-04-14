import move from '../../move'

const summonSome = geometry =>
  move.summon({
    types: ['fly'],
    geometry,
    range: 2,
  })

const summonFew = summonSome('circle')
const summonMany = summonSome('circle')

const defendOrAttack = move.switch.health({
  low: move.follow,
  medium: move.forward.random, //#! TODO move.forward.defend,
  high: move.forward.random,
})

const tasks = [
  move.ifHit(move.chain(move.energy.add('ultimate'), move.teleport(4))),
  move.energy.use('ultimate', 1, summonMany),
  move.wait(1),
  move.energy.add('energy'),
  move.energy.use('energy', 4, summonFew),
  move.forward.attackNearby,
  defendOrAttack,
]

export default {
  sprite: 'flyking',
  tasks,
  opts: { health: 8 },
}
