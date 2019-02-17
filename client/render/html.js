import uR from 'unrest.io'

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
    return `board w${W} h${H}`
  }
  update() {
    if (!this.container) {
      return
    }
    this.board.className = this.getClass()
    this.squares.forEach(square => square.update())
    this.board.pieces.forEach(this.renderPiece)
  }
  renderPiece = piece => {
    if (!this.cache[piece.id]) {
      this.cache[piece.id] = uR.element.create('div', {
        parent: this.container,
      })
    }
    this.cache[piece.id].className = getClassName(piece)
  }
}

const getClassName = entity => {
  const { xy, color, name, type, dxy } = entity
  let className = `${name} ${type} x${xy[0]} y${xy[1]} w1 h1`
  if (color) {
    className += ` color-${color}`
  }
  if (dxy) {
    className += ` dxy-${dxy.join('')}`
  }
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
    return `${this.type} x${xy[0]} y${xy[1]} w1 h1 color-${color}`
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
