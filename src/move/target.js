tW.move.target = function(action,opts={}) {
  opts = uR.defaults(opts, {
    geometry: "line",
    pass: function(s) { return s && s.piece && s.piece.team != this.team }, // pass on enemy target
    fail: function(s) { return !(s && s.isOpen()) }, // fail on any blocked square that didn't pass
  })
  const out = function() {
    if (this.targeted_piece) {
      var result =  action.call(this,this.targeted_piece);
      this.targeted_piece = false;
      if (result) { result.turn = [0,0] }
      return result;
    }
    for (let direction of tW.look.directions) {
      var squares = this.current_square.lookMany(tW.look[opts.geometry][direction][this.sight || opts.range]);
      for (let square of squares) {
        if (opts.pass.call(this,square)) {
          this.targeted_piece = direction;
          if (opts.wait_triggered && this.wait.isReady()) {
            return out.call(this);
          }
          return { turn: direction }
        }
        if (opts.fail.call(this,square)) { break }
      }
    }
  }
  out._name = `Target ${action._name || action.name}`;
  return out
}