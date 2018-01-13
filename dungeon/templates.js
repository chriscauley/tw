DG.TEMPLATES = {};

DG.TEMPLATES['zelda'] = {
  size: [55,55],
  seed: "zelda",
  rooms: {
    initial: {
      min_size: [3, 3],
      max_size: [3, 3],
      max_exits: 1,
    },
    any: {
      min_size: [11,11],
      max_size: [11,11],
      max_exits: 2,
    },
  },
  max_corridor_length: 0,
  min_corridor_length: 0,
  corridor_density: 0,
  symmetric_rooms: true,
  room_count: 10,
  max_interconnect_length: 1,
  interconnects: 0,
}
