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
]

class Level extends uR.Object {

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
  (new DungeonLevel({style:'zelda'})).level
]
