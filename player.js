class Combo extends uR.Object {
  constructor(opts={},interval=0) {
    super(opts);
    this.interval = interval;
    this.fails = 0;
    this.streak = 0;
    this.max = 0;
  }
  step() {
    this.fails = 0;
    this.streak ++;
    this.max = Math.max(this.streak,this.max);
  }
  break() {
    this.streak = 0;
  }
}

class DamageCombo extends Combo {
  apply(move={}) {
    if (move.damage) { this.step(); }
    else if (++this.fails > this.interval) {
      this.break()
    }
  }
}

class Player extends BasePiece {
  constructor(opts) {
    opts.gold_per_touch = Infinity;
    opts.gold_levels = [Infinity];
    opts.intervals = [0,4];
    super(opts);
    this.last_move = { x: 0, y:0, t:0 };
    this.defaults(opts,{
      game: uR.REQUIRED,
      torch: [
        [0,0,1,0,0],
        [0,1,1,1,0],
        [1,1,1,1,1],
        [0,1,1,1,0],
        [0,0,1,0,0],
      ],
      gold_levels: [],
    });
    this.combos = [
      new DamageCombo({},0),
      new DamageCombo({},1),
      new DamageCombo({},2),
      new DamageCombo({},3),
    ]
    this.move = this.move.bind(this);
    this.resetMiniMap();
    this.score = 0;
    this.defaults(opts,{ gold: 0 });
    this.is_player = true;
    this.inner_color = 'orange';
    this.sprite = uR.sprites['blue-flame'];
  }
  touchItem(item) {
    item.pickUp(this);
  }
  move(e,dx,dy) {
    var out = { turn: [dx,dy] };
    if (e.ctrlKey) {
      if (this.steps[1] < this.intervals[1]) { console.log("fail"); } // spell wasn't ready
      else { out = this.doubleForward(dx,dy) || out; }
      this.steps[1] = -1;
    }
    else {
      var square = this.look(dx,dy);
      if (square && square.piece && square.piece.team != this.team) { out.damage = [dx,dy,this.damage] }
      if (square && !square.piece) { out.move = [dx,dy] }
    }
    this.applyMove(out);
    this.ui_dirty = true;
    if (out.move) {
      this.last_move = {
        x: out.move[0],
        y: out.move[1],
        t: new Date().valueOf(),
      }
    }
    return true;
  }
  applyMove(opts) {
    super.applyMove(opts);
    this.combos && this.combos.map((c) => c.apply(opts));
    var self = this;
    var [dx,dy] = [this.dx,this.dy];
    uR.forEach(this.torch || [],function(row,tx) {
      var dx = tx-2;
      uR.forEach(row,function(on,ty) {
        if (!on) { return }
        var dy = ty-2;
        var square = self.board.getSquare(self.x+dx,self.y+dy);
        var c = "X";
        if (square) { c = " "; }
        if (!dx && !dy) { c = "P"; }
        try { self.minimap[self.y+dy][self.x+dx] = c; }
        catch (e) {}
      });
    });
  }
  addScore(points) {
    this.score += points;
  }
  die() {
    this.game.gameover();
  }
  draw() {
    super.draw()
    this.drawMoves()
  }
  drawMoves() {
    this.forEach([[0,1],[0,-1],[1,0],[-1,0]],function(dxdy) {
      var square = this.board.getSquare(this.x+dxdy[0],this.y+dxdy[1]);
      if (!square) { return }
      var x = square.x;
      var y = square.y;
      var s = this.board.scale;
      if (square.isOpen()) {
        this.board.canvas.ctx.fillStyle = "rgba(0,100,0,0.5)";
        this.board.canvas.ctx.fillRect(x*s,y*s,s,s);
      }
      if (square.canBeAttacked()) {
        this.board.canvas.ctx.fillStyle = "rgba(100,0,0,0.5)";
        this.board.canvas.ctx.fillRect(x*s,y*s,s,s);
      }
    });
  }
  resetMiniMap() {
    this.minimap = [];
    for (var y=0;y<this.board.y_max;y++) {
      var column = [];
      for (var x=0; x<this.board.x_max;x++) { column.push(" ") }
      this.minimap.push(column);
    }
  }
  printMiniMap() {
    var out = "";
    uR.forEach(this.minimap || [],function(row) { out += row.join(" ") + "\n" });
    return out;
  }
}
