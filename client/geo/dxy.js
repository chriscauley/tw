const MAP = new Map([
  ['N', [0, -1]], // up
  ['E', [1, 0]], // right
  ['S', [0, 1]], // down
  ['W', [-1, 0]], // left
])

const dxy = {
  MAP,
  names: [...MAP.keys()],
  list: [...MAP.values()],
  map: {},
  DXY2RAD: {},
  ZERO: [0, 0],
}

window.DXY = dxy
dxy.names.forEach((name, i) => {
  dxy.DXY2RAD[name] = (i / 2) * Math.PI
})

MAP.forEach((_dxy, name, _i) => {
  dxy[name] = _dxy
  dxy[_dxy] = name
})

export default dxy
