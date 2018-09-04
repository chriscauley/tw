window.uP = {
  sprites: {},
  sprite_list: [],
  scale: 32,
  ready: new uR.Ready(),
  app: { view: {} }, // dummy object so resize doesn't have to check if this exists
  resize: () => {
    uP.SIZE = 8
    // rescale everything when window resizes
    const window_length = Math.min(window.innerWidth,window.innerHeight)
    uP.app.scale = Math.pow(2,Math.floor(Math.log2(window_length/uP.SIZE)))
    uP.app.view.width = uP.app.view.height = uP.app.scale*uP.SIZE
  },
  LAYERS: ['BOARD','FLOOR','ITEM','VOID','PIECE','AIR','ANIMATION',undefined],
  LAYER_MAP: {},
  ASPEED: 15, // frames/square (~60fps)
}

uP.LAYERS.forEach( (l,i) => { uP.LAYER_MAP[i] = l; uP.LAYER_MAP[l] = i })
uP.resize()

tW.sprites.ready(() => {
  const window_length = 512 //Math.min(window.innerWidth,window.innerHeight)
  uP.app = new PIXI.Application({ width: window_length, height: window_length })
  // #! TODO putting each layer into a separate PIXI.display.Layer might improve performance?
  uP.app.stage = new PIXI.display.Stage()
  uP.app.stage.group.enableSort = true
  uP.resize()
  document.querySelector("#game").appendChild(uP.app.view)
  tW.sprites.list.concat(['red', 'lightgray', 'green', 'blue'].map(c => tW.sprites.wedge(c)))
    .forEach( (sprite,i) => {
      if (!PIXI.TextureCache[sprite.name]) {
        PIXI.loader.add(sprite.name, sprite.canvas.toDataURL())
      }
    })

  uP.addAnimations()
  const s = uP.app.scale
  PIXI.loader.load((loader, resources) => {
    uP.loadAnimations()
    window.TILE = uP.buildCompositeSprite("chessboard",{
      tiles: "ground1|ground2||ground2|ground1",
      _class: PIXI.extras.TilingSprite,
      app: uP.app,
    })
    uP.ready.start()
  })
})
