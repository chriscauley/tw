const BASE = {
  damage: 1,
  range: 1,
  geometry: '_line',
  slot: 'weapon',
  splash: false, // does damage to all squares in geometry
}

const types = {
  knife: {},

  spear: {
    range: 2,
  },

  longsword: {
    range: 2,
    splash: true,
    geometry: 'line',
  },

  katana: {
    range: 2,
  },

  scythe: {
    range: 2,
    geometry: '_cone',
    splash: true,
  },

  jambiya: {
    geometry: 'lr',
    splash: true,
  },
}

const entries = Object.entries(types)
entries.sort()

export default new Map(
  entries.map(([name, type]) => [
    name,
    {
      ...BASE,
      ...type,
      name,
    },
  ]),
)
