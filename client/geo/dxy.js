const MAP = new Map([
  ['N', [0, -1]], // up
  ['S', [1, 0]], // down
  ['W', [0, 1]], // left
  ['E', [-1, 0]], // right
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
