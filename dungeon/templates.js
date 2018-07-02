DG.TEMPLATES = {};

DG.TEMPLATES['zelda'] = {
  seed: "zelda",
  rooms: {
    any: {
      min_size: [11,11],
      max_size: [11,11],
      max_exits: 3,
    },
  },
  corridor_density: 0,
  symmetric_rooms: true,
  max_interconnect_length: 1,
}

DG.TEMPLATES['basic'] = {
  seed: "basic",
  rooms: {
    any: {
      min_size: [5,5],
      max_size: [8,8],
      max_exits: 2,
    },
  },
  corridor_density: 0,
  room_count: 15,
  max_interconnect_length: 5,
}

DG.TEMPLATES['rect'] = {
  room_count: 1,
  rooms: {
    initial: {
      max_size: [10,10],
      min_size: [5,5]
    },
  }
}

DG.TEMPLATES['tiny_rect'] = {
  room_count: 1,
  rooms: {
    initial: {
      max_size: [6,6],
      min_size: [4,4]
    },
  }
}