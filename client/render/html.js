import uR from 'unrest.io'
import types from '../piece/types'
import control from '../piece/system'

const ready = new uR.Ready()

class RenderBoard extends uR.db.Model {
  static slug = 'render_html.Board'
  static opts = {
    board: uR.REQURIED,
    parent: uR.REQUIRED,
  }
  constructor(opts) {
    super(opts)
    this.board.renderer = this
    this.sprites = {
      wall: 'dwarfwall',
      path: 'blood',
    }
    this.cache = {
      piece: {},
      wall: {},
      path: {},
    }
    this.draw()
    this.update = uR.performance.wrapFunction('update', this.update)
  }
  draw = () => {
    this.container = uR.element.create('div', {
      className: this.getClass(),
      parent: this.parent,
    })
    Object.entries(this.board.entities.wall).forEach(this.renderOne('wall'))
    Object.entries(this.board.entities.path).forEach(this.renderOne('path'))
    this.update()
  }
  getClass() {
    const { W, H } = this.board
    return `board w-${W} h-${H} tile tile-chessfloor`
  }
  update = () => {
    if (!this.container) {
      return
    }
    this.board.className = this.getClass()
    Object.values(this.board.entities.piece).forEach(this.renderPiece)
    const [x, y] = this.board.player.xy
    const { style } = this.container
    style.marginLeft = `-${x + 0.5}em`
    style.marginTop = `-${y + 0.5}em`
  }
  renderPiece = piece => {
    if (!this.cache.piece[piece.id]) {
      this.cache.piece[piece.id] = uR.element.create('div', {
        parent: this.container,
      })
    }
    this.cache.piece[piece.id].className = getClassName(piece)
  }
  removePiece = piece => {
    if (!piece.health) {
      this.cache.piece[piece.id].classList.add('dead')
      this.cache.piece[piece.id] = undefined
    }
  }
  renderOne = type => ([i, value]) => {
    if (!this.cache[type][i]) {
      this.cache[type][i] = uR.element.create('div', {
        parent: this.container,
      })
    }
    const [x, y] = this.board.i2xy(i)
    const sprite = this.sprites[type] + value
    const opts = { w: 1, h: 1, x, y, sprite }

    this.cache[type][i].className = 'square sprite ' + objToClassString(opts)
  }
}

const objToClassString = obj => {
  const items = []
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }
    items.push(`${key}-${value}`)
  })
  return items.join(' ')
}

const getClassName = entity => {
  const { xy, color, name, type, dxy, waiting, follow_order } = entity
  const { sprite } = types[type]
  const last_move = control.last_move[entity.id]
  const extras = {
    sprite,
    color,
    waiting,
    follow_order,
    dxy: dxy.join(''),
    damage: last_move && last_move.damage && dxy.join(''),
    x: xy[0],
    y: xy[1],
  }

  if (entity.target_dxy) {
    extras.waiting = 0
  }

  let className = `${name} ${type} w-1 h-1 sprite `
  className += objToClassString(extras)
  return className
}

export default {
  ready,
  RenderBoard,
}
