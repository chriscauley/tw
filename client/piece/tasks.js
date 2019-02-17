import move from '../move'

export default {
  walker: [move.wait(1), move.forward, move.flip],
  seeker: [move.findEnemy, move.wait(1), move.follow],
  drifter: [],
}
