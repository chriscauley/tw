<tw-scores>
  <div>Health: { player.health }</div>
  <div>Gold: { player.gold }</div>
  <div>Score: { player.score }</div>

  this.on("mount",function() {
    this.player = this.opts.player;
    this.opts.game.ui = this;
  });
</tw-scores>
