tW.move.follow = function follow() {
  if (!this.following) { return }
  const dx = this.following.x - this.x; //how far in each direction
  const dy = this.following.y - this.y;
  const distance = Math.abs(dx) + Math.abs(dy);
  if (this.following.is_dead || distance > this.sight*2) { this.following = undefined; return }
  const dirs = [[Math.sign(dx),0],[0,Math.sign(dy)]]; // defaults to check x direction first
  if (dy && this.dy) { // check the y direction first since unit is facing the y direciton
    dirs.reverse();
  }
  for (let direction of dirs) {
    let square = this.look(direction);
    if (!square) { continue }
    if (square.piece == this.following || square.isOpen()) { return tW.move.forward.call(this,direction); }
  }
}
