import move from '../move'

export default {
  respawn: {
    sprite: 'reincarnation',
    opts: { invulnerable: true },
    tasks: [
      move.energy.use(2).then(move.respawn),
      move.energy.add(1),
      move.done,
    ],
  },
}
