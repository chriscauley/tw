<tw-scores>
  <div>Health: { player.health }</div>
  <div>Gold: { player.gold }</div>

  this.on("mount",function() {
    this.player = this.opts.player;
    this.board = this.opts.board;
    this.board.ui = this;
  });
</tw-scores>
