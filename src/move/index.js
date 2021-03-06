(function() {
  class Move extends uR.RandomMixin(tW.look.Look(uR.Object)) {
    // Mixin for anything that needs to move
    buildHelp() {
      return {
        forward: "Move or attack the direction it's facing.",
        flip: "Turn to the opposite direction.",
        follow: "If following a unit, move or attack in the direction of the unit.",
        findEnemy: `Look ${this.sight} squares for an enemy to follow.`,
        throwFireball: `Creates a fireball in the direction this is facing.`,
        forwardRandomly: "Move in a random direction.",
        attackNearby: "Attack a nearby enemy.",
        turnRandomly: "Turn in a random direction.",
        wait: `Wait ${this.wait.interval} moves.`, // should be something like f.wait.interval
        "Target SpawningProjectile": `If an enemy is spotted within ${this.sight} squares, shoot a spawning projectile in that direction next turn.`,
        "Target buffSelf(Charge)": `If an enemy is spotted within ${this.sight} squares, charge in that direction until colliding with anything.`,
        burnout: 'If this piece cannot move it dies.',
        "wait.ifReady(attackNearby)": "If waited last turn, attack a nearby enemy.",
        "wait(5).then(spawnPiece)": "Every 5 turns, spawn an enemy.",
      }
    }
    countdown() {
      this.points = this.step%4+1;
    }
    bounce() {
      var square = this.lookForward();
      if (square && square.piece) { return this.attack(square.piece); }
    }
  }

  const burnout = function(move) {
    move.afterMove.push(()=>this.die())
  }
  tW.move = {
    Move: Move,
    burnout: burnout,
  };
})();
