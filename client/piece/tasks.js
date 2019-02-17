import wait from '../move/wait'
import flip from '../move/flip'
import forward from '../move/forward'

export default {
  walker: [wait(1), forward, flip],
}
