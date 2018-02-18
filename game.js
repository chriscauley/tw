class Game extends uR.Object {
  constructor() {
    super();
    this.config = new uR.Config("GAME_CONFIG");
    this.config.setSchema([
      { name: "W", type: "integer", value: 5 },
      { name: "H", type: "integer", value: 5 },
      { name: "piece_increase", type: "integer", value: 1 },
      { name: "show_intervals", type: "boolean", value: false },
      { name: "active_pieces", choices: ['c','v','w','wf','ge'], value: ['GE'], type: "checkbox" },
    ]);
    uR.extend(this,this.config.getData());
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
    this.piece_count = 0;
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
  keydown(e) {
    if (this.is_gameover) { return this.restart() }
    this.key_map[e._key] && this.key_map[e._key](e);
    this.ui && this.ui.update();
  }
  keyup(key) {}
  bindKeys() {
    var key_map = {
      up: (e) => this.player.move(e,0,-1),
      down: (e) => this.player.move(e,0,1),
      left: (e) => this.player.move(e,-1,0),
      right: (e) => this.player.move(e,1,0),
      space: (e) => this.player.move(e,0,0),
    }
    this.key_map = {};
    function d(f,self) {
      f = f.bind(self);
      return function(e) {
        f(e) && self.nextTurn();
      }
    }
    for (var k in key_map) { this.key_map[k] = d(key_map[k],this); }
  }
  nextTurn() {
    this.tnow = new Date().valueOf();
    this.board.pieces.forEach((p) => p.play());
    this.player.play();
  }
  onPiecePop(piece) {
    if (this.board.pieces.length == 1) { // only the player
      this.piece_count += 1*this.config.get('piece_increase');
      var enemy_count = 0;
      var board = this.board;
      var choice = uR.random.choice;
      var iter = 0;
      while(enemy_count<this.piece_count && iter<100) {
        var sq = choice(choice(this.board.squares));
        if (sq && !sq.piece) {
          board.pieces.push(new board.enemy_map[choice(this.config.get('active_pieces'))]({
            x:sq.x,y:sq.y,board:board,gold: this.piece_count,
          }));
          enemy_count += 1;
        }
        iter ++;
      }
    }
  }
}
