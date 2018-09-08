// #! TODO TOMORROW!!! add a bunch of sprites to target.pixi, but only add one app.ticker function
// that updates all the children sprites positions and rotations. Ultimately the redraw trigger will do
// target.pixi.sprites.map(PIXI.ease) calls

uP.bindSprite = (target,opts={}) => {
  target._sprite = target._sprite || target.constructor.name.toLowerCase()
  target.ax = target.ay = 0
  uR.defaults(opts,{
    slug: target._sprite,
    scale: 1,
  })
  uP.ready(() => {
    const app = uP.app// should be a constructor option... target.stage?
    const s = app.scale;
    if (!target.pixi) {
      target.pixi = riot.observable({
        removeAll: () => app.stage.removeChild(target.pixi.container),
        list: [],
        zIndex: uP.LAYER_MAP[target.LAYER],
        container: new PIXI.Container(),
        app: app,
      })
      let container = target.pixi.container
      container.zIndex = target.pixi.zIndex
      container.width = container.height = s*opts.scale;
      app.stage.addChild(container);
      const draw = (delta) => {
        if (delta && target.ax) { //needs to move
          let sign = Math.sign(target.ax) //direction
          target.ax -= sign*delta/uP.ASPEED
          if (sign != Math.sign(target.ax)) { target.ax = 0 } // overshot target
        }
        if (delta && target.ay) {
          let sign = Math.sign(target.ay)
          target.ay -= sign*delta/uP.ASPEED
          if (sign != Math.sign(target.ay)) { target.ay = 0 }
        }
        container.x = (target.x-target.ax)*s;
        container.y = (target.y-target.ay)*s;
      }
      target.pixi.on('redraw',draw)
      target.pixi.on('hide', () => container.visible = false)
      target.pixi.on('show', () => container.visible = true)
      opts.is_mobile && app.ticker.add(draw)
    }
    const container = target.pixi.container
    var child = target.pixi[opts.slug]
    if (child) {
      child.texture = PIXI.TextureCache[opts.slug]
    } else {
      child = target.pixi[opts.slug] = new PIXI.Sprite(PIXI.TextureCache[opts.slug])
      container.addChild(child)
      opts.is_rotate && target.pixi.on('redraw',() => {
        child.rotation = tW.look.DIR2RAD[target.dxdy]
      })
      child.anchor.x = child.anchor.y = 0.5
      child.width = child.height = s*opts.scale;
    }
    target.pixi.trigger("redraw")
  })
}