import _ from 'lodash'
import move from '../move'

const momentum = move.energy('momentum')

const roll = move.find([move.ifDidDamage(move.forward, move.flip), move.flip])

const ball = {
  sprite: 'ball',
  friendly_fire: 'true',
  opts: { health: 255 },
  // #! TODO resolve balls colliding before tasks
  // maybe priority tasks?
  tasks: [
    move.ifHit(move.chain([momentum.add(1), move.forward.fromHit])),

    momentum.has(4).chain([move.morph('bigball'), momentum.set(1), roll]),

    momentum.has(1).then(roll),
  ],
}

const fireball = {
  sprite: 'fireball',
  tasks: [move.ifDidDamage(move.forward, move.burnout), move.burnout],
}

/*const flyball = {
  sprite: '',
  opts: { health: 100 },
  tasks: [
    move.ifHit(
      move.chain(move.energy.add('energy', 6), move.forward.fromHit),
    ),
    move.energy.use(
      'energy',
      1,
      move.find([move.forward, move.forward.turnOrFlip]),
    ),
  ],
}*/

export default { ball, fireball }
