const MAP = new Map([
  ['N', [0,-1]], // up
  ['S', [1,0]], // down
  ['W', [0,1]], // left
  ['E', [-1,0]], // right
])


const dxy = {
  MAP,
  NAMES: [...MAP.keys()],
  list: [...MAP.values()],
  map: {},
  DXY2RAD: {},
  ZERO: [0,0],
}

dxy.NAMES.forEach( (name,i) => {
  dxy.DXY2RAD[name] = i/2*Math.PI
})

MAP.forEach(
  (dxy,name,i) => {
    dxy[name] = dxy
    dxy[dxy] = name
  }
)

export default dxy