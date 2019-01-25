tW.move.useEnergy = function useEnergy(move,dxdy) {
  // currently only used for balls
  // used to block task queue when energy runs out
  if (this._energy >= 1) {
    move._energy = -1
    if (this._energy == 1) { move._turn = tV.ZERO }
  } else {
    move.done = true
  }
}