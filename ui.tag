<tw-scores>
  <div>Health: { player.health }</div>
  <div>Gold: { player.gold }</div>
  <div>Score: { player.score }</div>
  <pre class="minimap">{ player.printMiniMap() }</pre>
  <div class="admin">
    <button onclick={ showSprites }>show sprites</button>
    <div each={ settings }>
      <button onclick={ editSettings }>{ name }</button>
    </div>
  </div>

  this.on("mount",function() {
    this.player = this.opts.player;
    this.opts.game.ui = this;
    this.game = this.opts.game;
    this.settings = [
      { name: "Game Config", config: this.game.config },
      { name: "Sprite Colors", config: uR.sprites.config }
    ]
    this.update();
  });
  showSprites() {
    uR.alertElement('tw-sprites');
  }
  editSettings(e) {
    var self = this;
    var name = e.item.name;
    var config = e.item.config;
    var opts = {
      schema: config.getSchema(),
      initial: {},
      submit: function (riot_tag) {
        config.update(riot_tag.getData());
      },
      autosubmit: true,
      onUnmount: function() { window.location.reload() }
    }
    uR.forEach(config.keys,(key)=> { opts.initial[key] = config.get(key) });
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
