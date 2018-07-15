uR.tw = {game_config: new uR.Config("GAME_CONFIG")};
uR.ready(function() {
  var PIECE_CHOICES = ['sk','fly','be','zombie','sp'];
  var SEED_CHOICES = ['42',['RANDOM','Randomize level']]
  /*for (var key in tW.enemy_map) {
    PIECE_CHOICES.push([key,tW.enemy_map[key].name]);
    }*/
  var MAP_CHOICES = [];
  for (var key in DG.TEMPLATES) { MAP_CHOICES.push(key) }
  uR.tw.game_config.setSchema([
    { name: "base_units", type: "integer", value: 1 },
    { name: "piece_count", type: "integer", value: 1 },
    { name: "piece_increase", type: "integer", value: 1 },
    { name: "active_pieces", choices: PIECE_CHOICES, value: PIECE_CHOICES, type: "checkbox", required: false },
    { name: "map_template", choices: MAP_CHOICES.sort(), value: MAP_CHOICES[0], type: 'select' },
    { name: "seed", choices: SEED_CHOICES, required: false, type: 'select', value: "RANDOM" },
  ]);
});
tW.Game = class Game extends uR.Object {
  constructor() {
    super();
    this.config = uR.tw.game_config;
    riot.observable(this);
    uR.extend(this,this.config.getData());
    this.bindKeys();
    this.board = new tW.Board({ game: this, });
    this.controller = new uR.controller.Controller({ parent: this, target: document.getElementById("game") });
    this.restart();
    this.makeUI();
    this.turn = 0;
  }
  nextLevel() {
    this.level_number++;
    this.board.loadLevel(this.level_number);
    this.makeTeams();
    this.makeUnits();
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
    this.piece_count = this.config.get("piece_count");
    this.level_number = -1;
    this.nextLevel();
    this.player.reset();
    this.score = this.player.score = new Score({ game: this, player: this.player });
    this.board.draw();
    this.is_gameover = false;
    document.getElementById("game").focus();
    this.ui && this.ui.update();
  }
  makeTeams() {
    this.teams = [];
    var unit_count = parseInt(this.config.get("base_units")) + this.level_number*this.config.get("piece_increase");
    for (var i=0;i<2;i++) {
      this.teams.push(new tW.team.Team({game: this, unit_count:unit_count}))
    }
  }
  gameover() {
    this.is_gameover = true;
    uR.alertElement("tw-gameover",{game: this});
  }
  mousedown(e) {
    // this conditional stops the popup when they click on #game to focus
    if (e.target.tagName == "CANVAS") { this.board.mousedown(e); }
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
        if(f(e)) {
          self.nextTurn();
          e.preventDefault();
        }
      }
    }
    for (var k in key_map) { this.key_map[k] = d(key_map[k],this); }
  }
  nextTurn() {
    this.tnow = new Date().valueOf();
    this.turn++;
    //uR.timeIt(()=> this.board.pieces.forEach((p) => p.play()))();
    this.board.pieces.forEach((p) => p.play());
  }
  makeUnits() {
    for (var team of this.teams) {
      team.makeUnits();
    }
    if (this.player) {
      this.player.board = undefined;
      this.board.getRandomEmptySquare({room:'i'}).addPiece(this.player);
    } else {
      this.player = new tW.player.Player({
        square: this.board.getRandomEmptySquare({room:'i'}),
        game: this,
        health: 3,
        team: 1, // #! TODO this is where competative multiplayer happens
      });
    }
    //new tW.item.Apple({square: this.board.getRandomEmptySquare() });
    //new tW.item.Steak({square: this.board.getRandomEmptySquare() });
  }
  dumpData() {
    var out = {};
    for (var model of [SpriteSheet,Sprite]) {
      out[model.name] = model.objects.all().map(m => m.toJson());
    }
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI("var __DATA="+JSON.stringify(out));
    hiddenElement.target = '_blank';
    hiddenElement.download = 'data.json';
    hiddenElement.click();
  }
}