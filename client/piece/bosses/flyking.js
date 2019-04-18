import move from '../../move'

const defendOrAttack = move.switch.health({
  low: move.follow,
  medium: move.forward.random, //#! TODO move.forward.defend,
  high: move.forward.random,
})

const tasks = [
  move.ultimate.bounceSummon({
    types: ['fly'],
    geometry: '_lrfb',
    range: 2,
    count: 4,
  }),

  move.energy.use(4).then(
    move.summon({
      types: ['fly'],
      geometry: '_lrfb',
      range: 2,
      count: 2,
    }),
  ),

  move.wait(1),
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
