// main PIXI application, useful for chaining loading promises
uP.app = {
  view: {}
}
uP.resize = () => {
  uP.W = 8
  // rescale everything when window resizes
  const window_length = Math.min(window.innerWidth,window.innerHeight)
  uP.app.scale = Math.pow(2,Math.floor(Math.log2(window_length/uP.W)))
  uP.app.view.width = uP.app.view.height = uP.app.scale*uP.W
}

uP.resize()

tW.sprites.ready(() => {
  const window_length = 512 //Math.min(window.innerWidth,window.innerHeight)
  uP.app = new PIXI.Application({ width: window_length, height: window_length })
  uP.resize()
  document.querySelector("#game").appendChild(uP.app.view)
  tW.sprites.list.forEach( (sprite,i) => {
    if (!PIXI.TextureCache[sprite.name]) {
      PIXI.loader.add(sprite.name, sprite.canvas.toDataURL())
    }
  })
  const s = uP.app.scale
  PIXI.loader.load((loader, resources) => {
    window.TILE = uP.buildCompositeSprite("chessboard",{
      tiles: "ground1|ground2||ground2|ground1",
      _class: PIXI.extras.TilingSprite,
      app: uP.app,
    })
    uP.ready.start()
  })
})
