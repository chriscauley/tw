import find from './find'

import follow from './follow'

import flip from './flip'
import forward, { forwardRandomly } from './forward'

import target from './target'
import wait from './wait'

// contitionals
import ifLookedAt from './ifLookedAt'
import ifHit from './ifHit'
import ifDidDamage from './ifDidDamage'

// actions piece does to self
import booOff from './booOff'
import burnout from './burnout'
import teleport from './teleport'

import chain from './chain'
import cycle from './cycle'

import summon from './summon'
import shoot from './shoot'

import energy from './energy'
import _switch from './switch'

export default {
  find,
  follow,

  flip,
  forward,
  forwardRandomly,

  target,
  cycle,
  switch: _switch,
  chain,
  wait,

  ifLookedAt,
  ifHit,
  ifDidDamage,

  booOff,
  teleport,
  burnout,

  energy,

  shoot,
  summon,
}
