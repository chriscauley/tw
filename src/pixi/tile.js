uP.buildCompositeSprite = (name,opts) => {
  uR.defaults(opts,{
    tiles: name,
    //_class: PIXI.Sprite,
    app: uR.REQUIRED,
  })
  const s = uP.app.scale
  const container = new PIXI.Container()

  // "a|b||b|d" => [['a','b'],['c','d']]
  opts.tiles.split("||").map(s => s.split("|")).forEach((row,ir) =>{
    row.forEach((_name,ic) => {
      if (!_name) { return } // allows for sloppy pipes
      let square = new PIXI.Sprite(PIXI.TextureCache[_name])
      square.width = square.height = s
      square.x = s*ic
      square.y = s*ir
      container.addChild(square)
    })
  })
  const _r = opts.app.renderer
  const tex = _r.generateTexture(container)
  const sprite = new opts._class(tex,_r.width,_r.height)
  uP.sprite_list.push(uP.sprites[name] = sprite)
  opts.app.stage.addChild(sprite)
  return sprite
}
