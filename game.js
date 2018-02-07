class Game extends uR.Object {
  constructor() {
    super()
    this.bindKeys();
    this.board = new Board({ game: this, });
    this.controller = new Controller({ parent: this });
    this.restart()
  }
  nextLevel() {
    this.level_number++;
    this.board.loadLevel(this.level_number);
  }
  restart() {
    var mask = document.querySelector("[ur-mask]");
    mask && mask.click();
    this.piece_count = 2;
    this.ui && this.ui.unmount();
    this.level_number = -1;
    this.nextLevel();
    uR.newElement(
      "tw-scores",
      { parent: document.querySelector("#game") },
      { player: this.player, game: this }
    );
    this.player.health = this.player.max_health;
    this.player.gold = 0;
    this.board.draw();
    this.is_gameover = false;
  }
  gameover() {
    this.is_gameover = true;
    uR.alertElement("tw-gameover",{game: this});
  }
  keydown(key) {
    if (this.is_gameover) { return this.restart() }
    this.key_map[key] && this.key_map[key]();
    this.ui && this.ui.update();
  }
  keyup(key) {}
  bindKeys() {
    var key_map = {
      up: function() { this.player.move(0,-1); },
      down: function() { this.player.move(0,1); },
      left: function() { this.player.move(-1,0); },
      right: function() { this.player.move(1,0); },
      space: function() { this.player.move(0,0); },
    }
    this.key_map = {};
    function d(f,self) {
      f = f.bind(self);
      return function() {
        f();
        self.nextTurn();
      }
    }
    for (var k in key_map) { this.key_map[k] = d(key_map[k],this); }
  }
  nextTurn() {
    this.board.pieces.forEach(function(p) { p.play() });
  }
  onPiecePop(piece) {
    if (!this.board.pieces.length) {
      this.piece_count += 2;
      var enemy_count = 0;
      var board = this.board;
      var choice = uR.random.choice;
      while(enemy_count<this.piece_count) {
        var sq = choice(choice(this.board.squares));
        if (sq && !sq.piece) {
          board.pieces.push(new board.enemy_map[choice(['WF','W'])]({
            x:sq.x,y:sq.y,board:board,gold: this.piece_count,
          }));
          enemy_count += 1;
        }
      }
    }
  }
}
