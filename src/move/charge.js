tW.move.Charge = (superclass) => class Charge extends superclass {
  buildHelp() {
    return _.extend(super.buildHelp(),{
      //checkCharge: "Looks for an enemy "+this.tunnel_sight+" squares away or less",
      //doCharge: "Charges in the direction of an enemy spotted by 'checkCharge'",
    })
  }
  charge(func,opts={}) {
    func = func.bind(this);
    opts = uR.defaults(opts, {
      range: this.sight,
      geometry: "line",
      pass: s => s && s.piece && s.piece.team != this.team, // pass on enemy target
      fail: s => !s || s.piece && s.piece.team == this.team, // fail on no square or friendly target
    })
    function out() {
      if (this.charged) {
        var result =  func(this.charged);
        this.charged = false;
        if (result) { result.turn = [0,0] }
        return result;
      }
      for (let direction of tW.look.directions) {
        var squares = this.current_square.lookMany(tW.look[opts.geometry][direction][opts.range]);
        for (let square of squares) {
          if (opts.pass(square)) {
            this.charged = direction;
            return { turn: direction }
          }
          if (opts.fail(square)) { break }
        }
      }
    }
    out._name = `Charge ${func.name}@${opts.distance}`;
    return out
  }
}