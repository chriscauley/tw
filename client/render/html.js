import uR from 'unrest.io'

const ready = new uR.Ready()

class RenderBoard extends uR.db.Model {
  static slug = "render_html.Board"
  static opts = {
    board: uR.REQURIED,
    parent: uR.REQUIRED,
  }
  constructor(opts) {
    super(opts)
    this.board.renderer = this
    ready(this.draw)
  }
  draw = () => {
    this.container = uR.element.create("div",{
      className: this.getClass(),
      parent: this.parent,
    })
    this.squares = this.board.squares.map(
      square => new RenderSquare({
        obj: square,
        parent: this.container,
      })
    )
  }
  getClass() {
    const { W, H } = this.board
    return `board w${W} h${H}`
  }
  update() {
    if (!this.container) { return }
    this.board.className = this.getClass()
    this.squares.forEach(square => square.update())
    this.board.pieces
      .filter(p => !p.renderer)
      .forEach(p => new RenderPiece({
        obj: p,
        parent: this.container
      }))
  }
}

class RenderOne extends uR.db.Model {
  static opts = {
    parent: uR.REQUIRED,
    obj: uR.REQUIRED,
  }
  constructor(opts) {
    super(opts)
    this.type = this.constructor.slug.split(".")[1].toLowerCase()
    this.obj.renderer = this
    this.draw()
  }
  getClass() {
    const { xy, color } = this.obj
    return `${this.type} x${xy[0]} y${xy[1]} w1 h1 color-${color}`
  }
  draw = () => {
    this.sprite = uR.element.create("div",{
      className: this.getClass(),
      parent: this.parent,
    })
  }
  update() {
    this.sprite.className = this.getClass()
  }
}

class RenderSquare extends RenderOne {
  static slug = "render_html.Square"
}

class RenderPiece extends RenderOne {
  static slug = "render_html.Piece"
  getClass() {
    return super.getClass() + ` dxy-${this.obj.dxy.join("")}`
  }
}

export default {
  ready,
  RenderBoard,
  RenderSquare,
}