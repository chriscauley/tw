// #! TODO TOMORROW!!! add a bunch of sprites to target.pixi, but only add one app.ticker function
// that updates all the children sprites positions and rotations. Ultimately the redraw trigger will do
// target.pixi.sprites.map(PIXI.ease) calls

const _setLayer = (target,opts={}) => {
  if (typeof opts == "string") {
    opts = { name: "__base__", texture: opts };
  }
  uR.defaults(opts,{
    texture: uR.REQUIRED,
    name: opts.texture,
  })
  uP.ready(() => {
    const s = target.pixi.scale;
    if (!target.pixi) { uP._newPixi(target,opts) }
    if (opts.redraw) {
      // #! TODO rotate would be better in here
      target.pixi.on('redraw',opts.redraw);
    }
    const container = target.pixi.container
    var child = target.pixi[opts.name]
    if (child) {
      child.texture = PIXI.TextureCache[opts.texture]
      if (opts.scale) {
        child.width = child.height = s*opts.scale;
      }
    } else {
      child = target.pixi[opts.name] = new PIXI.Sprite(PIXI.TextureCache[opts.texture])
      container.addChild(child)
      opts.is_rotate && target.pixi.on('redraw',() => {
        child.rotation = tW.look.DIR2RAD[target.dxdy]
      })
      child.anchor.x = child.anchor.y = 0.5;
      child.width = child.height = s*(opts.scale || 1);
      target.pixi.list.push(child);
    }
    target.pixi.trigger("redraw")
  })
}

uP.bindPixi = (target,opts={}) => {
  const app = target.board.pixi.app;
  const s = app.scale || 64;
  target._sprite = target._sprite || target.constructor.name.toLowerCase()
  target.ax = target.ay = 0
  target.pixi = riot.observable({
    remove: () => app.stage.removeChild(target.pixi.container),
    list: [],
    zIndex: uP.LAYER_MAP[target.LAYER],
    container: new PIXI.Container(),
    app: app,
    scale: s,
    setLayer: o => _setLayer(target,o),
  })
  let container = target.pixi.container
  container.zIndex = target.pixi.zIndex
  container.width = container.height = s
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
