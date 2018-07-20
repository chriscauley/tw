(function() {
  class Move extends uR.RandomMixin(tW.look.Look(uR.canvas.CanvasObject)) {
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
        "Target SpawningProjectile": `If an enemy is spotted within ${this.sight} squares, shoot a spawning projectile in that direction next turn`,
        burnout: 'If this piece cannot move it dies.',
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

  const burnout = function() {
    this.die();
    return { done: true };
  }
  tW.move = {
    Move: Move,
    burnout: burnout,
  };
})();
