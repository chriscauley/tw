tW.utils = {};
tW.player = {};

tW.utils.Counter = class Counter extends uR.Object {
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{
      min: 0,
      max: 1,
      interval: 1,
      value: 0,
      step: 0,
    });
  }
  tick(num=1) {
    if (this.value == this.max) { return }
    if (this._used) { this._used = false; return; }
    this.step += num;
    while (this.step >= this.interval) {
      this.value += 1;
      this.step -= this.interval;
    }
    if (this.value >= this.max) {
      this.value = this.max;
      this.step = 0;
    }
  }
  getBinaryArray() {
    var out = uR.math.zeros(this.max);
    for (var i=0;i<this.value;i++) { out[i] = 1 }
    return out;
  }
  getArray() {
    var out = this.getBinaryArray()
    if (this.value != this.max) { out[this.value] = this.step/this.interval }
    return out;
  }
  minus(num=1) { this.add(-num); }
  add(num=1) {
    this.value += num;
    if (this.value > this.max) { this.value = this.max; this.step = 0; }
    if (this.value < this.min) { this.value = this.min; this.step = 0; }
    this._used = true;
  }
  canAdd(num=1) {
    var result = this.value + num;
    return !(result > this.max || result < this.min);
  }
}

tW.player.Player = class Player extends tW.pieces.BasePiece {
  constructor(opts) {
    opts.gold_per_touch = Infinity;
    opts.intervals = [0];
    opts.sprite = tW.sprites['warrior'];
    super(opts);
    this.last_move = { dx: 0, dy:0, t:0 };
    this._moves = [];
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
      max_energy: 3,
      energy_interval: 4,
      gold: 0,
    });
    this.action_halo = "blue_halo";
    this.move = this.move.bind(this);
    this.is_player = true;
    this.reset();
  }
  reset() {
    this.health = this.max_health;
    this.gold = 0;
    this.resetMiniMap();
    this.equipment = {};
    this.energy = new tW.utils.Counter({
      max: this.max_energy,
      interval: this.energy_interval,
    });
    this.game.board.getSquare(this.x,this.y).addPiece(this);
    new tW.equipment.SprintBoots().equip(this);
  }
  getHealthArray() {
    var array = uR.math.zeros(this.max_health);
    for (var i=0;i<this.health; i++) { array[i] = 1; }
    return array;
  }
  addItem(item) {
    var slot = item.slot;
    var old_item = this.equipment[slot];
    item.bind(player);
    this.current_square && this.current_square.removeItem(item);
    this.equipment[slot] = item;
    if (old_item) {
      this.dropItem(old_item);
    }
  }
  dropItem(item) {
    this.current_square.addItem(old_item);
  }
  equipItem(item) {
    item.player = this;
    this.equipment[item.slot] = item;
  }
  touchItem(item) {
    item.pickUp(this);
  }
  getMove(e,dx,dy) {
    var out = { turn: [dx,dy] };
    if (e.ctrlKey && this.intervals[1]) {
      //out = this.doSpecial();
      if (this.steps[1] < this.intervals[1]) { console.log("fail"); } // spell wasn't ready
      else { out = this.doubleForward(dx,dy) || out; }
      this.steps[1] = -1;
    } else if (e.shiftKey && this.equipment.feet) {
      return this.equipment.feet.getMove(dx,dy);
    } else {
      var square = this.look(dx,dy);
      if (square && square.piece && square.piece.team != this.team) {
        out.damage = [dx,dy,this.damage];
        out.damage.piece = square.piece;
      }
      if (square && !square.piece) { out.move = [dx,dy] }
    }
    return out;
  }
  move(e,dx,dy) {
    var out = this.getMove(e,dx,dy);
    out.key = e.key;
    this.applyMove(out);
    this.ui_dirty = true;
    if (out.move) {
      this.last_move = {
        dx: out.move[0],
        dy: out.move[1],
        t: new Date().valueOf(),
        damage: out.damage,
      }
    }
    return true;
  }
  applyMove(opts) {
    var result = super.applyMove(opts);
    this.combos && this.combos.map((c) => c.apply(result));
    var self = this;
    var [dx,dy] = [this.dx,this.dy];
    if (opts && opts.resources) { // maybe put in pieces.js BasePiece instead
      for (var key in opts.resources) {
        this[key].add(opts.resources[key]);
      }
    }
    uR.forEach(this.torch || [],function(row,tx) { // should be in update minimap method
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
    result && this.score.apply(result);
    return result;
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
  drawUI() {
  }
  drawMoves() {
    if (true) { return }
    var s = this.board.scale;
    if (this.game.turn != this.last_turn_drawn) {
      this._moves = [];
      this.forEach([[0,1],[0,-1],[1,0],[-1,0]],function(dxdy) {
        var square = this.board.getSquare(this.x+dxdy[0],this.y+dxdy[1]);
        if (!square) { return }
        if (square.isOpen()) {
          this._moves.push(["rgba(0,100,0,0.5)",square.x,square.y]);
        } else if (square.canBeAttacked() && square.piece.team != this.team) {
          this._moves.push(["rgba(100,0,0,0.5)",square.x,square.y]);
        }
      });
      this.last_turn_drawn = this.game.turn;
    }
    for (var move of this._moves) {
      this.board.canvas.ctx.fillStyle = move[0];
      this.board.canvas.ctx.fillRect(move[1]*s,move[2]*s,s,s);
    }
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
  play(opts) {
    super.play(opts);
    this.energy.tick();
    if (this.go_to_next_level) {
      this.game.nextLevel();
      this.go_to_next_level = false;
    }
  }
}
