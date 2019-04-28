import done from './done'
import chess from './chess'
import find from './find'
import follow from './follow'

import flip from './flip'
import forward, { forwardRandomly } from './forward'
import ultimate from './ultimate'

import target from './target'
import wait from './wait'

// contitionals
import ifLookedAt from './ifLookedAt'
import ifHit from './ifHit'
import ifMoved from './ifMoved'
import ifDidDamage from './ifDidDamage'

// actions piece does to self
import booOff from './booOff'
import burnout from './burnout'
import teleport from './teleport'

import chain from './chain'
import _switch from './switch'
import cycle from './cycle'

import summon from './summon'
import shoot from './shoot'
import morph from './morph'

import energy from './energy'
import setAfter from './setAfter'
import respawn from './respawn'

export default {
  done,
  chess,
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
  ifMoved,
  ifDidDamage,

  booOff,
  teleport,
  burnout,
  setAfter,

  energy,

  shoot,
  summon,
  morph,
  ultimate,
  respawn,
}
