import move from '../../move'

const types = {
  pawn: {
    sprite: 'pawn',
    tasks: [
      //move.energy.has(6).then(move.morph('queen')),
      move.wait(1),
      move.ifMoved(
        move.find([
          move.chess.attack(['s', 'd']),
          //move.forward.noAttack,
        ]),
        move.energy.add(1),
      ),
    ],
  },
}

export default types
