tW.level = {}
tW.level.LEVELS = [
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
tW.level.Level = class Level extends uR.Object {
  constructor(opts) {
    super(opts);
    this.defaults(opts ||{},{
      W:8,
      H:5,
    });
  }
}

tW.level.RectRoom = class RectRoom extends tW.level.Level {
  constructor(opts) {
    function parseWH(n) {
      if (typeof(n) == "string" && n.indexOf("-") != -1) {
        var [lo,hi] = n.split("-");
        return uR.randint(parseInt(lo),parseInt(hi));
      }
      return parseInt(n);
    }
    super(opts);
    this.H = parseWH(this.H);
    this.W = parseWH(this.W);
    this.min_wh = Math.min(this.H,this.W);
    this.half_wh = Math.floor(this.min_wh/2);
    this.level = [];
    for (var y=0;y<this.H;y++) { this.level.push(uR.math.zeros(this.W)) }
    this.level[this.half_wh][this.half_wh] = "s";
    this.level[this.H-this.half_wh][this.W-this.half_wh] = "e";
    this.level[2][2] = " ";
  }
}

tW.level.Dungeon = class Dungeon extends DG.Dungeon {
  constructor(opts={}) {
    opts.style && uR.defaults(opts,DG.TEMPLATES[opts.style] || {});
    super(opts);
    this.generate();
    this.level = this.toArray();
  }
}
