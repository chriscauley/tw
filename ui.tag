<tw-scores>
  <div>Health: { player.health }</div>
  <div>Gold: { player.gold }</div>
  <div>Score: { player.score }</div>
  <pre class="minimap">{ player.printMiniMap() }</pre>
  <div class="admin">
    <button onclick={ showSprites }>show sprites</button>
    <button onclick={ editSettings }>settings</button>
  </div>

  this.on("mount",function() {
    this.player = this.opts.player;
    this.opts.game.ui = this;
    this.game = this.opts.game;
  });
  showSprites() {
    uR.alertElement('tw-sprites');
  }
  editSettings() {
    var self = this;
    var opts = {
      schema: this.game.config.getSchema(),
      initial: {},
      submit: function (riot_tag) {
        console.log(riot_tag.getData());
        self.game.config.update(riot_tag.getData());
        riot_tag.unmount();
      },
    }
    uR.forEach(game.config.keys,(key)=> { opts.initial[key] = game.config.get(key) });
    uR.alertElement("ur-form",opts);
  }
</tw-scores>

<tw-gameover>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <h1>Game over!</h1>
      <p>Press any key to restart</p>
    </div>
  </div>
  this.on("unmount",function() {
    this.opts.game.restart();
  });
</tw-gameover>

<tw-sprites>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <div each={ sprites }>
        <img src={ canvas.toDataURL() } />
      </div>
    </div>
  </div>
  this.on("mount",function() {
    var keys = [];
    for (var key in uR.sprites) { keys.push(key) }
    keys.sort();
    this.sprites = [];
    for (var i=0;i<keys.length;i++) { this.sprites.push(uR.sprites[keys[i]]) }
    this.update();
  });
</tw-sprites>
