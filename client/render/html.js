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
    this.pieces = []
    this.cache = {}
    this.draw()
  }
  draw = () => {
    this.container = uR.element.create('div', {
      className: this.getClass(),
      parent: this.parent,
    })
    this.squares = this.board.squares.map(
      square =>
        new RenderSquare({
          obj: square,
          parent: this.container,
        }),
    )
    this.update()
  }
  getClass() {
    const { W, H } = this.board
    return `board w-${W} h-${H} tile tile-chessfloor`
  }
  update() {
    if (!this.container) {
      return
    }
    this.board.className = this.getClass()
    this.squares.forEach(square => square.update())
    this.board.pieces.forEach(this.renderPiece)
    const [x, y] = this.board.pieces[0].xy
    const { style } = this.container
    style.marginLeft = `-${x + 0.5}em`
    style.marginTop = `-${y + 0.5}em`
  }
  renderPiece = piece => {
    if (!this.cache[piece.id]) {
      this.cache[piece.id] = uR.element.create('div', {
        parent: this.container,
      })
    }
    this.cache[piece.id].className = getClassName(piece)
  }
  removePiece = piece => {
    this.cache[piece.id].classList.add('dead')
    this.cache[piece.id] = undefined
  }
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

  let className = `${name} ${type} w-1 h-1 sprite`
  Object.entries(extras).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }
    className += ` ${key}-${value}`
  })
  return className
}

class RenderOne extends uR.db.Model {
  static opts = {
    parent: uR.REQUIRED,
    obj: uR.REQUIRED,
  }
  constructor(opts) {
    super(opts)
    this.type = this.constructor.slug.split('.')[1].toLowerCase()
    this.obj.renderer = this
    this.draw()
  }
  getClass() {
    const { xy, color } = this.obj
    return `${this.type} x-${xy[0]} y-${xy[1]} w-1 h-1 color-${color}`
  }
  draw = () => {
    this.sprite = uR.element.create('div', {
      className: this.getClass(),
      parent: this.parent,
    })
  }
  update() {
    this.sprite.className = this.getClass()
  }
}

class RenderSquare extends RenderOne {
  static slug = 'render_html.Square'
}

export default {
  ready,
  RenderBoard,
  RenderSquare,
}
