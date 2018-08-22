uR.router.add({
  "#!/pixi/": uR.router.routeElement("ur-pixi"),
})


<ur-pixi>

  <script>
this.on("mount",function() {
  PIXI.settings.SCALE_MODE=PIXI.SCALE_MODES.NEAREST
  const app = new PIXI.Application({})
  window.px = app
  app.renderer = PIXI.autoDetectRenderer(600,600)
  _.extend(app.renderer,{
    transparent: false,
    antiAlias: false,
    backgroundColor: 0xFFFFFF,
  })

  this.root.appendChild(app.view);
  tW.sprites.ready(() => {
    tW.sprites.list.forEach( (sprite,i) => {
      PIXI.loader.add(sprite.name, sprite.canvas.toDataURL())
    })
    const s = Math.min(app.view.width,app.view.height)/10
    PIXI.loader.load((loader, resources) => {
      tW.sprites.list.forEach( (sprite,i) => {

        let bunny = new PIXI.Sprite(resources[sprite.name].texture);
        bunny.width = s
        bunny.height = s

        bunny.x = s*(i%10)
        bunny.y = s*Math.floor(i/10)

        app.stage.addChild(bunny);
      })
    })
  })
})
  </script>
</ur-pixi>