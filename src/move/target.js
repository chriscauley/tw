tW.move.target = function(action,opts={}) {
  opts = uR.defaults(opts, {
    geometry: "line",
    pass: function(s) { return s && s.piece && s.piece.team != this.team }, // pass on enemy target
    fail: function(s) { return !(s && s.isOpen()) }, // fail on any blocked square that didn't pass
  })
  const out = function(move) {
    if (this.targeted) { // piece was targeted last turn
      action.call(this,move,this.targeted);
      move.afterMove.push(() => this.targeted = false) // targeting only lasts one turn
      //move.turn = [0,0];
      return;
    }
    for (let direction of tW.look.directions) {
      var squares = this.current_square.lookMany(tW.look[opts.geometry][direction][this.sight || opts.range]);
      for (let square of squares) {
        if (opts.pass.call(this,square)) {
          this.targeted = direction;
          if (opts.instant || opts.wait_triggered && this.wait.isReady()) {
            move.turn = direction;
            out.call(this,move); // some targets get applied now if no wait
          }
          return
        }
        if (opts.fail.call(this,square)) { break }
      }
    }
  }
  out._name = `Target ${action._name || action.name}`;
  return out
}