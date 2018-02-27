var LEVELS = [
  ["  x000  ",
   "  0000  ",
   "00B00000",
   "000  000",
   "000  000",
   "000000s0",
   "  B000  ",
   "  00CC  "],
  ["00000000",
   "B0B00000",
   "0B000000",
   "B0B  000",
   "0B0  000",
   "B0B  000",
   "xB0  000",
   "000  00s"],
  ["000000000",
   "000000000",
   "000000000",
   "000000000",
   "0000s0000",
   "000000000",
   "000000000",
   "000000000",
   "000000000",
  ]
]
class Level extends uR.Object {
  constructor(opts) {
    super(opts);
    this.defaults(opts ||{},{
      W:8,
      H:5,
    });
  }
}

class RectRoom extends Level {
  constructor(opts) {
    super(opts);
    this.H = this.H*1;
    this.W = this.W*1;
    this.level = [];
    for (var y=0;y<this.H;y++) { this.level.push(uR.math.zeros(this.W)) }
    this.level[Math.floor(this.H/2)][Math.floor(this.W/2)] = "s";
  }
}

class DungeonLevel extends Level {
  constructor(opts) {
    if (opts.style && DG.TEMPLATES[opts.style]) {
      uR.defaults(opts,DG.TEMPLATES[opts.style]);
    }
    super(opts);

    var dungeon = new DG.Dungeon(opts);
    dungeon.generate();
    this.level = dungeon.toArray();
  }
}

LEVELS = [
  //(new DungeonLevel({style:'zelda'})).level,
  //LEVELS[2]
  new RectRoom().level
]

uR.level = {
  RectRoom: RectRoom,
}
