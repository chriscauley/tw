tW.room.WALL_GENERATORS = [
  (r) => {}, // null move
  (r) => {
    const xys = [];
    [r.xmin+1,r.xmax-1].map(x => {
      [r.ymin+1,r.ymax-1].map(y=> xys.push([x,y]))
    })
    r.board.getSquares({ xys: xys }).forEach(s => s.addWall(1))
  }
]
