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
  });
  showSprites() {
    uR.alertElement('tw-sprites');
  }
  editSettings() {
    var opts = {
      schema: [],
      initial: this.opts.game.config,
      submit: function (riot_tag) {
        uR.storage.set("GAME_CONFIG",riot_tag.getData());
        riot_tag.unmount();
      },
    }
    for (var key in opts.initial) { opts.schema.push(key); }
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
