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

var dungeon = new DG.Dungeon({
  size: [50, 50],
  seed: 'abcd', //omit for generated seed
  rooms: {
    initial: {
      min_size: [3, 3],
      max_size: [3, 3],
      max_exits: 1,
      position: [0, 0] //OPTIONAL pos of initial room
    },
    any: {
      min_size: [4, 4],
      max_size: [10, 10],
      max_exits: 4
    }
  },
  max_corridor_length: 6,
  min_corridor_length: 2,
  corridor_density: 0.5, //corridors per room
  symmetric_rooms: false, // exits must be in the center of a wall if true
  interconnects: 1, //extra corridors to connect rooms and make circular paths. not 100% guaranteed
  max_interconnect_length: 10,
  room_count: 10
});

dungeon.generate();

LEVELS = [
  dungeon.toArray()
]
