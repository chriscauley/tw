import uR from 'unrest.io'

const ready = new uR.Ready()

class Board extends uR.db.Model {
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
      square => new Square({
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

class Square extends uR.db.Model {
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
    const { x, y, color } = this.square
    return `square x${x} y${y} w1 h1 color-${color}`
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
  Board,
}