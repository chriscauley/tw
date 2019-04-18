import chain from './chain'
import energy from './energy'
import find from './find'
import ifHit from './ifHit'
import teleport from './teleport'
import setAfter from './setAfter'
import summon from './summon'

const bounceSummon = opts => {
  const ultimate = energy('ultimate')
  return find([
    ifHit(chain([ultimate.add(1), teleport(4), setAfter({ energy: 0 })])),
    ultimate.use(1).then(summon(opts)),
  ])
}

export default {
  bounceSummon,
}
