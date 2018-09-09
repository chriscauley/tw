uP.setBuff = (target,slug,value=0) => {
  const y = 0; // currently only works with one buff because y is hardcoded
  if (!target.pixi.buffs) {
    target.pixi.buffs = {}
  }
  const sprites = target.pixi.buffs[slug] = target.pixi.buffs[slug] || [];
  while (sprites.length && sprites.length > value) {
    target.pixi.container.removeChild(sprites.pop())
  }
  while (sprites.length < value) {
    const _sprite = new PIXI.Sprite(PIXI.TextureCache[slug])
    _sprite.anchor.x = _sprite.anchor.y = 0.5
    const s = target.pixi.app.scale
    const w = _sprite.width = _sprite.height = (value == 1)?s/3:s/5
    _sprite.y = s/2 - w * (1+y)
    _sprite.x = s/2 - w * (1+sprites.length)
    target.pixi.container.addChild(_sprite)
    sprites.push(_sprite)
  }
}