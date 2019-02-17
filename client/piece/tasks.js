import move from '../move'

const task_map = {
  walker: [move.wait(1), move.forward, move.flip],
  seeker: [move.findEnemy, move.wait(1), move.follow],
  drifter: [move.wait(1), move.attackNearby, move.forwardRandomly],
  bouncer: [move.cycle(move.flip, move.forward)],
}

task_map.names = Object.keys(task_map)
task_map.short2type = {}
task_map.names.forEach(name => (task_map.short2type[name[0]] = name))

export default task_map
