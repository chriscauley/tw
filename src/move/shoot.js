(function() {
  tW.move.shoot = (projectile) => {
    function shoot(move,dxdy) {
      dxdy = dxdy || this.dxdy
      var square = this.look(dxdy);
      if (!square) { console.error("no square"); return } // no square to target
      if (!square.piece && !square.isOpen(dxdy)) { return } // some non-piece obstacle
      if (square.piece) {
        if (!square.canBeAttacked(this)) { return } // don't attack friends
        move.damage = { squares: [square], count: this.damage};
        move.turn = dxdy;
      } else {
        new projectile({ // #! TODO this should be in afterMove
          parent_piece: this,
          dxdy: dxdy,
          damage: this.damage,
          square: square,
          _prng: this,
        });
      }
      move.done = true;
      move.force_done = true;
    }
    shoot._name = projectile.name;
    return shoot;
  }
})();