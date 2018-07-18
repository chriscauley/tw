(function() {
  tW.move.shoot = (projectile) => {
    function shoot(dxdy) {
      dxdy = dxdy || [this.dx,this.dy]
      var square = this.look(dxdy);
      if (!square) { console.error("no square"); return } // no square to target
      if (!square.piece && !square.isOpen(dxdy)) { return } // some non-piece obstacle
      if (square.piece) {
        if (square.piece.team == this.team) { return } // don't attack friends
        return { damage: {squares: [square], count: this.damage}, dx: dxdy[0], dy: dxdy[1] }
      }
      new projectile({
        parent_piece: this,
        dx: dxdy[0],
        dy: dxdy[1],
        damage: this.damage,
        square: square,
        _prng: this,
      });
      return { done: true };
    }
    shoot._name = projectile.name;
    return shoot;
  }
})();