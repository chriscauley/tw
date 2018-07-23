tW.move.follow = function follow(move) {
  if (!this.following) { return }
  const dx = this.following.x - this.x; //how far in each direction
  const dy = this.following.y - this.y;
  const distance = Math.abs(dx) + Math.abs(dy);
  if (this.following.is_dead || distance > this.sight*2) { this.following = undefined; return }
  const dirs = [[Math.sign(dx),0],[0,Math.sign(dy)]]; // defaults to check x direction first
  if (this.dy) { // piece is facing in the y-direction
    if (this.dy == Math.sign(dy)) { dirs.reverse(); } // facing piece, check y-direction first
  } else { // facing x-direction
    if (this.dx != Math.sign(dx)) { dirs.reverse(); } // facing away, check y-direction first
  }

  for (let direction of dirs) {
    let square = this.look(direction);
    if (!square) { continue }
    if (square.piece == this.following || square.isOpen()) {
      tW.move.forward.call(this,move,direction);
      break;
    }
  }
}
