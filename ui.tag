<tw-scores>
  <div class="health">
    <i class="fa fa-heart { red:h }" each={ h in health }></i>
  </div>
  <div class="energy">
    <i data-energy={ e } each={ e,i in energy }></i>
  </div>
  <div class="logs" ref="logs">
    <div each={ log,i in player.logs }>
      { log.key }
      <span if={ log.damage }>
        <img src={ sword } />
        { log.damage.piece.constructor.name }</span>
    </div>
  </div>
  <!-- <div>Gold: { player.gold }</div> -->
  <!-- <div>Score: { player.score }</div> -->
  <!-- <\!--<pre class="minimap">{ player.printMiniMap() }</pre>-\-> -->
  <!-- <div class="combos"> -->
  <!--   <h4>Combos</h4> -->
  <!--   <div each={ c in player.combos }>{ c.interval }: { c.streak } (max: { c.max })</div> -->
  <!-- </div> -->

  this.on("before-mount",function() {
    this.player = this.opts.player;
    this.opts.game.ui = this;
    this.game = this.opts.game;
  });
  this.on("mount",function() { this.update() });
  this.on("update",function() {
    this.health = this.player.getHealthArray();
    this.energy = this.player.energy.getArray();
    this.sword = tW.sprites.get("sword").img.toDataURL();
    // this.settings = [
    //   { name: "Game Config", config: this.opts.game.config },
    // ]
    // for (let key of tW.sprites.keys) {
    //   var sprite = tW.sprites[key];
    //   if (!sprite.config.keys.length) { continue }
    //   sprite.draw();
    //   this.settings.push({ name: "Sprite - " + sprite.name, config: sprite.config });
    // }
  });
  this.on("updated",function() {
    this.refs.logs.scroll(0,this.refs.logs.scrollHeight);
  });
  // showSprites() {
  //   uR.alertElement('tw-sprites');
  // }
  // editSettings(e) {
  //   e.item.config.openEditor();
  // }
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
        <h2>{ name }</h2>
        <img src={ canvas.toDataURL() } />
        <hr/>
      </div>
    </div>
  </div>
  this.on("mount",function() {
    this.sprites = [];
    for (let key of tW.sprites.keys) { tW.sprites[key].draw(); this.sprites.push(tW.sprites[key]); }
    this.update();
  });
</tw-sprites>
