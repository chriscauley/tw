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
    uP.app.view.width = uP.app.view.height = 512//uP.app.scale*uP.SIZE
  },
  LAYERS: ['BOARD', 'FLOOR', 'ITEM', 'VOID', 'PIECE', 'AIR', 'ANIMATION', undefined],
  LAYER_MAP: {},
  ASPEED: 15, // frames/square (~60fps)
}

uP.LAYERS.forEach( (l,i) => { uP.LAYER_MAP[i] = l; uP.LAYER_MAP[l] = i })
uP.resize()

tW.sprites.ready(() => {
  const window_length = 512 //Math.min(window.innerWidth,window.innerHeight)
  uP.app = new PIXI.Application({ width: window_length, height: window_length })
  // #! TODO putting each layer into a separate PIXI.display.Layer might improve performance?
  const stage = uP.app.stage = new PIXI.display.Stage()
  uP.app.stage.group.enableSort = true
  uP.resize()
  uP.app.config = new uR.Config("pixi-form",{
    scale: 1,
    x: 0,
    y: 0,
  })
  uP.app.openEditor = () => {
    uP.app.config.openEditor({
      mount_to: "#scores-form",
      submit: (form) => {
        const data = form.getData()
        stage.scale.x = stage.scale.y = data.scale;
      },
    })
  }
  document.querySelector("#game").appendChild(uP.app.view)
  _.flatten([
    tW.sprites.list,
    ['red', 'lightgray', 'green', 'blue'].map(c => tW.sprites.wedge(c)),
    ['red','blue', 'black'].map(c => tW.sprites.halo(c)),
  ]).forEach( (sprite,i) => {
    if (!PIXI.TextureCache[sprite.name]) {
      PIXI.loader.add(sprite.name, sprite.canvas.toDataURL())
    }
  })

  const _half = window_length/2;
  const recenter = () => {
    const player = tW.game && tW.game.player;
    if (!player || !player.pixi) { return }
    const sprite = player.pixi.container;
    uP.app.stage.x = -sprite.x+_half;
    uP.app.stage.y = -sprite.y+_half;
  }
  uP.app.ticker.add(recenter);
  uP.addAnimations()
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

