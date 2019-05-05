const BASE = {
  damage: 1,
  range: 1,
  geometry: '_line',
  slot: 'weapon',
  splash: false, // does damage to all squares in geometry
}

const types = {
  knife: {},

  longsword: {
    range: 2,
    splash: true,
    geometry: 'line',
  },

  katana: {
    geometry: 'three',
    splash: true,
  },

  spear: {
    range: 2,
    step: true,
  },

  scythe: {
    range: 2,
    geometry: '_three',
    splash: true,
    step: true,
  },

  jambiya: {
    geometry: 'lr',
    splash: true,
    step: true,
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
