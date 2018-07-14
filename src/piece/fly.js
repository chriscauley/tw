(function() {
  class Fly extends tW.pieces.BasePiece {
    constructor(opts={}) {
      opts.sprite = tW.sprites['fly'];
      super(opts);
      this.tasks = [ this.forward,this.turnRandomly ];
    }
    turnRandomly() {
      // turns left or right if the square is empty. If no empty square, turn randomly
      var directions = ['left','right'];
      var square,direction;
      while (directions.length) {
        var d = directions[(uR.random()>0.5)?'pop':'shift']();
        square = this.look(this._turn(d));
        if (square && !square.piece) { break; }
      }
      return this._turn(d);
    }
  }

  class FlyKing extends tW.pieces.BasePiece {
    constructor(opts={}) {
      super(opts);
      this.pieces = [Fly];
      this.tasks = [
        tW.move.Wait(this,8,{name:'_spawn_wait'}).then(tW.move.spawnPiece),
        this.findEnemy,
        //this.stayNearEnemy,
      ]
    }
  }

  tW.enemy_map.fly = tW.pieces.Fly = Fly;
  tW.enemy_map.flyking = tW.pieces.FlyKing = FlyKing;
})();
