uR.tw = {game_config: new uR.Config("GAME_CONFIG")};
uR.ready(function() {
  var PIECE_CHOICES = [];
  for (var key in tW.enemy_map) {
    PIECE_CHOICES.push([key,tW.enemy_map[key].name]);
  }
  uR.tw.game_config.setSchema([
    { name: "W", type: "integer", value: 5 },
    { name: "H", type: "integer", value: 5 },
    { name: "base_units", type: "integer", value: 1 },
    { name: "piece_count", type: "integer", value: 1 },
    { name: "piece_increase", type: "integer", value: 1 },
    { name: "show_intervals", type: "boolean", value: false },
    { name: "active_pieces", choices: PIECE_CHOICES, value: ['GE'], type: "checkbox" },
  ]);
});
tW.Game = class Game extends uR.Object {
  constructor() {
    super();
    this.config = uR.tw.game_config;
    uR.extend(this,this.config.getData());
    this.bindKeys();
    this.board = new tW.Board({ game: this, });
    this.nextLevel();
    this.makeTeams();
    this.makeUnits();
    this.makeUI();
    this.controller = new uR.controller.Controller({ parent: this });
    this.turn = 0;
    this.piece_count = this.config.get("piece_count");
  }
  nextLevel() {
    this.level_number++;
    this.board.loadLevel(this.level_number);
  }
  makeUI() {
    uR.newElement(
      "tw-scores",
      { parent: document.querySelector("#game") },
      { player: this.player, game: this }
    );
  }
  restart() {
    var mask = document.querySelector("[ur-mask]");
    mask && mask.click();
    this.piece_count = 0;
    this.ui && this.ui.unmount();
    this.level_number = -1;
    this.nextLevel();
    this.player.health = this.player.max_health;
    this.player.gold = 0;
    this.board.draw();
    this.is_gameover = false;
  }
  makeTeams() {
    this.teams = [];
    for (var i=0;i<2;i++) {
      this.teams.push(new tW.team.Team({game: this}))
    }
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
    this.turn++;
    this.board.pieces.forEach((p) => p.play());
  }
  makeUnits() {
    var start = this.board.start;
    this.player = new tW.player.Player({
      game: this,
      board: this.board,
      health: 3,
      team: 1, // #! TODO this is where competative multiplayer happens
      x: start[0],
      y: start[1],
    });
    this.board.pieces.push(this.player);
    this.player.x = start[0]+1;
    this.player.y = start[1];
    this.player.resetMiniMap();
    this.player.applyMove();
    for (var team of this.teams) {
      this.board.addPieces(team.makeUnits());
    }
    this.onPiecePop();
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
          board.addPieces(new tW.enemy_map[choice(this.config.get('active_pieces'))]({
            x:sq.x,y:sq.y,board:board,gold: this.piece_count,
          }));
          enemy_count += 1;
        }
        iter ++;
      }
    }
  }
};
