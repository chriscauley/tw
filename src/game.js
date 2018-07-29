tW.game_config =  new uR.Config("GAME_CONFIG");
uR.ready(function() {
  var PIECE_CHOICES = ['sk','fly','be','zombie','sp'];
  var SEED_CHOICES = ['42',['','Randomize level']]
  /*for (var key in tW.enemy_map) {
    PIECE_CHOICES.push([key,tW.enemy_map[key].name]);
    }*/
  var MAP_CHOICES = [];
  for (var key in DG.TEMPLATES) { MAP_CHOICES.push(key) }
  var MOOK_CHOICES = [];
  for (var key in tW.MOOK_MAP) { MOOK_CHOICES.push(key) }
  const BOSS_CHOICES = ['default']
  tW.game_config.setSchema([
    { name: "level_count", type: "integer", value: 5 },
    { name: "piece_count", type: "integer", value: 4 },
    { name: "piece_increase", type: "integer", value: 1 },
    { name: "boss_count", type: "integer", value: 1 },
    { name: "map_template", choices: MAP_CHOICES.sort(), value: MAP_CHOICES[0], type: 'select' },
    { name: "seed", choices: SEED_CHOICES, required: false, type: 'select', value: "RANDOM" },
    { name: "mook_set", choices: MOOK_CHOICES, type: 'select', value: 'default' },
    { name: "boss_set", choices: BOSS_CHOICES, type: 'select', value: 'default' },
  ]);
});
tW.Game = class Game extends uR.RandomObject {
  constructor(opts={}) {
    uR.defaults(opts,tW.game_config.getData())
    if (!opts.seed) { opts.seed = Math.ceil(Math.random()*Math.pow(2,24)); }
    super(opts);
    this.opts = opts;
    if (this.opts.is_replay) {
      this.loadReplay();
    }
    riot.observable(this);
    this.bindKeys();
    this.controller = new uR.controller.Controller({ parent: this, target: document.getElementById("game") });
    this.board = new tW.Board({ game: this, _prng: this });
    this.restart();
    this.makeUI();
    this.turn = 0;
  }
  nextLevel() {
    this.level_number++;
    if (this.level_number >= this.opts.level_count) {
      this.won = true;
      return this.gameover();
    }
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
    var container = document.getElementById("game");
    container.classList.remove("gameover");
    if (this.in_replay) { container.classList.add("in_replay"); }
    else { container.classList.remove("in_replay"); }
    var mask = document.querySelector("[ur-mask]");
    mask && mask.click();
    this.piece_count = this.opts.piece_count;
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
    for (var i=0;i<2;i++) {
      this.teams.push(new tW.team.Team({
        game: this,
        _prng: this,
      }))
    }
  }
  gameover() {
    this.is_gameover = true;
    document.getElementById("game").classList.add("gameover")
    uR.mountElement("tw-gameover",{game: this, mount_to: "#score"});
  }
  loadReplay() { // maybe should be `Replay().loadGame(opts)`? nb: opts is just this.opts
    this.moves = [];
    this.in_replay = true;
    for (let values of this.opts.move_values) { // rehydrate
      let move = {};
      this.opts.move_keys.map((k,i) => move[k] = values[i])
      this.moves.push(move);
    }
    tW.AUTO_REPLAY && setTimeout(this.stepReplay.bind(this),tW.ANIMATION_TIME);
  }
  stepReplay() {
    const move = this.moves[this.turn];
    this.player.move(move,...move.dxdy)
    this.nextTurn();
    if (this.AUTO_REPLAY && this.turn != this.moves.length) {
      setTimeout(this.stepReplay.bind(this),tW.ANIMATION_TIME);
    }
  }
  saveReplay() { // should be `Replay({ game: this })`? classmethod?
    const keys = []; // this whole packing/unpacking list may be unecessary if we gzip the storage
    for (var key in this.player.moves[0]) { keys.push(key) }
    const opts = _.clone(this.opts)
    opts.is_replay = true;
    opts.move_keys = keys;
    opts.move_values = this.player.moves.map( m => keys.map(k => m[k])); // dehydrate
    const replay = new uR.db.replay.Replay({
      hash: objectHash(opts),
      game_opts: opts,
    })
    replay.save();
  }
  mousedown(e) {
    // this conditional stops the popup when they click on #game to focus
    if (e.target.tagName == "CANVAS") { this.board.mousedown(e); }
  }
  keydown(e) {
    if (this.is_gameover || this.opts.is_replay) { return }
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
        _prng: this,
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
