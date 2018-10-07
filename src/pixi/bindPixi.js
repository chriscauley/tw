(function() {
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
    target.pixi.redraw();
  })
}

const ease_list = new PIXI.extras.Ease.list();

uP.bindPixi = (target,opts={}) => {
  /* Adds target.pixi to an object which is an interface for controlling the object's
   graphic representation. This consists of several layers set by target.pixi.setLayer. */
  const app = target.board.pixi.app;
  const s = app.scale || 64;
  target._sprite = target._sprite || target.constructor.name.toLowerCase()
  target.pixi = riot.observable({
    remove: () => app.stage.removeChild(target.pixi.container),
    list: [],
    zIndex: uP.LAYER_MAP[target.LAYER],
    container: new PIXI.Container(),
    app: app,
    scale: s,
    setLayer: o => _setLayer(target,o),
    easeTo: () => {
      const to_x = target.x*s;
      const to_y = target.y*s;
      const to = ease_list.add(new PIXI.extras.Ease.to(container,{ x: to_x, y: to_y },150))
    },
    moveTo: () => container.position.set(target.x*s,target.y*s),
    redraw: uR.debounce(() => target.pixi.trigger("redraw"),0),
  })
  let container = target.pixi.container;
  container.zIndex = target.pixi.zIndex;
  container.width = container.height = s;
  app.stage.addChild(container);
  target.pixi.moveTo();
  target.pixi.on('hide', () => container.visible = false)
  target.pixi.on('show', () => container.visible = true)
}
})()