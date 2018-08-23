uR.router.add({
  "#!/pixi/": uR.router.routeElement("ur-pixi"),
})

<ur-pixi>
  <script>
this.on("mount",function() {
  PIXI.settings.SCALE_MODE=PIXI.SCALE_MODES.NEAREST
  const app = new PIXI.Application({
    //antialias: false
  })
  uP.app = app
  app.renderer = PIXI.autoDetectRenderer(600,600)
  _.extend(app.renderer,{
    transparent: false,
    backgroundColor: 0xFFFFFF,
  })

  this.root.appendChild(app.view);
  tW.sprites.ready(() => {
    tW.sprites.list.forEach( (sprite,i) => {
      PIXI.loader.add(sprite.name, sprite.canvas.toDataURL())
    })
    const s = uP.scale
    PIXI.loader.load((loader, resources) => {
      uP.resources = resources
      var tiles = ""
      const random = new uR.Random()
      const numbers = [0,1,5,6,7,4,2,3]
      const N = numbers.length
      for (var i=0;i<N*N;i++) {
        tiles += `r${numbers[(Math.floor(i/8)+i)%N]}|`
        if (i && !((i+1)%N)) { tiles += "|" }
      }
      uP.buildCompositeSprite("chessboard",{
        tiles: tiles,
        _class: PIXI.extras.TilingSprite,
        app: app,
      })
      tW.sprites.list.forEach( (sprite,i) => {
        if (sprite.name.length ==2) { return } // no rainbows
        let bunny = new PIXI.Sprite(resources[sprite.name].texture);
        bunny.width = s
        bunny.height = s

        bunny.x = s*(i%8)
        bunny.y = s*Math.floor(i/8)

        app.stage.addChild(bunny);
      })
    })
  })
})
  </script>
</ur-pixi>