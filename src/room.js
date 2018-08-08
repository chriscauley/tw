tW.room = {
  Room:class Room extends uR.Object {
    constructor(opts={}) {
      super(opts);
      this.defaults(opts,{
        squares: uR.REQUIRED,
      })
      const xs = this.squares.map(s=>s.x)
      const ys = this.squares.map(s=>s.y)
      this.xmax = Math.max(...xs)
      this.xmin = Math.min(...xs)
      this.ymax = Math.max(...ys)
      this.ymin = Math.min(...ys)
      this.H = this.xmax-this.xmin
      this.W = this.ymax-this.ymin
      this.squares.map(s=>s.room=this)
    }
  }
}