<tw-scores>
  <div>Health: { player.health }</div>
  <div>Gold: { player.gold }</div>
  <div>Score: { player.score }</div>
  <pre class="minimap">{ player.printMiniMap() }</pre>

  this.on("mount",function() {
    this.player = this.opts.player;
    this.opts.game.ui = this;
  });
</tw-scores>

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
