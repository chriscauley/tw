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
        square,
        parent: this.container,
      })
    )
  }
  getClass() {
    const { W, H } = this.board
    return `board w${W} h${H}`
  }
  update() {
    this.board.className = this.getClass()
    this.squares && this.squares.forEach(square => square.update())
  }
}

class RenderSquare extends uR.db.Model {
  static slug = "render_html.Square"
  static opts = {
    parent: uR.REQUIRED,
    square: uR.REQUIRED,
  }
  constructor(opts) {
    super(opts)
    this.draw()
  }
  getClass() {
    const { xy, color } = this.square
    return `square x${xy[0]} y${xy[1]} w1 h1 color-${color}`
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

export default {
  ready,
  RenderBoard,
  RenderSquare,
}