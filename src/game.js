tW.game_config =  new uR.Config("GAME_CONFIG");
uR.ready(function() {
  var PIECE_CHOICES = ['sk','fly','be','zombie','sp'];
  var SEED_CHOICES = ['42',['RANDOM','Randomize level']]
  /*for (var key in tW.enemy_map) {
    PIECE_CHOICES.push([key,tW.enemy_map[key].name]);
    }*/
  var MAP_CHOICES = [];
  for (var key in DG.TEMPLATES) { MAP_CHOICES.push(key) }
  var MOOK_CHOICES = [];
  for (var key in tW.MOOK_MAP) { MOOK_CHOICES.push(key) }
  const BOSS_CHOICES = ['default']
  tW.game_config.setSchema([
    { name: "piece_count", type: "integer", value: 4 },
    { name: "piece_increase", type: "integer", value: 1 },
    { name: "boss_count", type: "integer", value: 1 },
    { name: "map_template", choices: MAP_CHOICES.sort(), value: MAP_CHOICES[0], type: 'select' },
    { name: "seed", choices: SEED_CHOICES, required: false, type: 'select', value: "RANDOM" },
    { name: "mook_set", choices: MOOK_CHOICES, type: 'select', value: 'default' },
    { name: "boss_set", choices: BOSS_CHOICES, type: 'select', value: 'default'},
  ]);
});
tW.Game = class Game extends uR.RandomObject {
  constructor(opts={}) {
    uR.defaults(opts,tW.game_config.getData())
    super(opts);
    this.opts = opts;
    if (this.opts.moves) {
      this.loadReplay(this.opts);
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
    this.saveReplay();
    this.is_gameover = true;
    uR.alertElement("tw-gameover",{game: this});
  }
  loadReplay(data) { // maybe should be `Replay().loadGame(opts)`? nb: opts is just this.opts
    this.moves = [];
    for (let values of opts.move_values) { // rehydrate
      let move = {};
      opts.move_keys.map(k,i => move[k] = values[i])
      this.moves.append(move);
    }
  }
  saveReplay() { // should be `Replay({ game: this })`? classmethod?
    const keys = []; // this whole packing/unpacking list may be unecessary if we gzip the storage
    for (var key in this.player.moves[0]) { keys.push(key) }
    const opts = _.clone(this.opts)
    opts.move_keys = keys;
    opts.move_values = this.player.moves.map( m => keys.map(k => m[k])); // dehydrate
    const replay = new uR.db.replay.Replay({
      hash: objectHash(opts),
      opts,
    })
    replay.save();
  }
  mousedown(e) {
    // this conditional stops the popup when they click on #game to focus
    if (e.target.tagName == "CANVAS") { this.board.mousedown(e); }
  }
  keydown(e) {
    if (this.is_gameover) { return }
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
