import move from '../move'

const momentum = move.energy('momentum')

const roll = move.find([move.ifDidDamage(move.forward, move.flip), move.flip])
const opts = { health: 255, sight: 0 }

const ball = {
  opts,
  sprite: 'ball',
  friendly_fire: 'true',
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
  damage_animation: 'explode',
  tasks: [move.ifDidDamage(move.forward, move.burnout), move.burnout],
  opts: { sight: 0 },
}

const fireball_bat = {
  ...fireball,
  sprite: ' sprite1x1-fireball_bat',
  tasks: [
    move.ifDidDamage(move.forward, move.burnout),
    move.chain([
      move.burnout, // dies
      move.summon({
        // replace with bat
        types: 'drifter',
        range: 0,
        //buff: { type: 'haste', charges: 4 },
      }),
    ]),
  ],
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

export default { ball, fireball, fireball_bat }
