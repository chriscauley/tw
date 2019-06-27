import _ from 'lodash'
import riot from 'riot'

import uR from 'unrest.io'
import types from '../piece/types'
import paint from '../move/paint'
import geo from '../geo'

//const { List } = uR.db
const observer = riot.observable()

// javascript's % is remainder, not modulus
const mod = (n, m) => {
  return ((n % m) + m) % m
}

// how many squares are rendered outside of view (radially)
const MIRRORS = [[0, 0], [0, 2], [2, 0], [2, 2]]

const base_layer = {
  sprite: '',
  getValue(xy, board) {
    return this._getValue(xy, board)
  },
  _getValue(xy, board) {
    return board.getOne(this.name, xy)
  },
  getResults(xys, board) {
    const results = []
    xys.forEach(xy => {
      const value = this.getValue(xy, board)
      value !== undefined && results.push([xy, value])
    })
    return results
  },
  getSprite(value, _renderer) {
    return this.sprite + value
  },
}

const layers = {
  wall: {
    sprite: 'wall-',
  },
  path: {
    sprite: 'vine',
  },
  piece: {
    prop_names: [
      'color',
      'name',
      'type',
      'dxy',
      'follow_order',
      'following',
      '_sprite',
      'moved',
    ],
    getResults(xys, board, renderer) {
      const results = []
      xys.forEach(xy => {
        const piece = board.getOne('piece', xy)
        if (piece) {
          const value = _.pick(piece, this.prop_names)
          value.following = !!value.following
          results.push([xy, value])

          // Pieces need thier tasks rendered as animations
          paint
            .paintTasks(piece._type.tasks, piece)
            .filter(Boolean)
            .forEach(result => renderer.animations.push(result))
        }
      })
      return results
    },
  },
  square: {
    sprite: 'floor',
    getValue(xy, board) {
      // any layer with full sprites should not show squares
      if (!board.getOne('square', xy) || board.getOne('wall', xy)) {
        return
      }
      return mod(mod(xy[0], 2) + xy[1], 2)
    },
  },
  item: {},
  animation: {
    getResults(xys, board, renderer) {
      const visible = {}
      const results = []
      xys.forEach(xy => (visible[xy] = true))
      renderer.animations.forEach(value => {
        visible[value.xy] && results.push([value.xy, value])
      })
      return results
    },
  },
  box: {
    getResults(xys, board, renderer) {
      const results = []
      const boxy = (xy, sprite) => {
        if (xy[0] % 1) {
          sprite += ' mx-half'
        }
        if (xy[1] % 1) {
          sprite += ' my-half'
        }
        results.push([[Math.floor(xy[0]), Math.floor(xy[1])], sprite])
      }

      renderer.hover_xys.forEach(xy => boxy(xy, 'hover0'))
      if (!board.player) {
        boxy(renderer.origin, 'hover1')
        boxy([0, 0], 'hover1')
      }
      return results
    },
  },
  fire: {
    getValue(xy, board) {
      const value = this._getValue(xy, board)
      if (!value) {
        return
      }
      const dxy = board.getOne('dxy_fire', xy)
      const moved = board.renderer.moved_fire[xy] ? undefined : dxy.join('')
      board.renderer.moved_fire[xy] = true
      return {
        xy,
        dxy,
        value,
        type: 'fireball',
        name: 'piece',
        moved,
      }
    },
  },
  floor_dxy: {
    sprite: 'greenarrow',
    getValue(xy, board) {
      const value = this._getValue(xy, board)
      return value && value.join('')
    },
  },
  ash: {
    sprite: 'ash-',
  },
  gold: {
    sprite: 'gold-',
    getSprite(value, renderer) {
      let sprite = this.sprite + value
      // #! TODO cache these conditionals on renderer for each turn
      if (renderer.board.player && renderer.board.isGoldOverThreshold()) {
        sprite += ' red-outline'
        if (renderer.board.player.combo === 1) {
          sprite += ' red-inner'
        }
      }
      return sprite
    },
  },
  room: {
    sprite: 'room-',
    getValue(xy, board) {
      const value = board.getOne('room', xy)
      return value && ' room-0'
    },
  },
}

Object.entries(layers).forEach(([name, layer]) => {
  layers[name] = {
    name,
    ...base_layer,
    ...layer,
  }
})

export class RenderBoard extends uR.db.Model {
  static slug = 'render_html.Board'
  static fields = {
    diameter: 8,
    offset: 0.5,
    overflow: 0,
    box_count: 0,
    scale: 32,
    origin: uR.db.Field([0, 0]),
    follow_player: true,
  }
  static editable_fieldnames = ['diameter', 'box_count', 'scale']

  static opts = {
    board: uR.REQURIED,
  }
  constructor(opts) {
    opts.origin = opts.origin || opts.board.start
    super(opts)
    this.board.renderer = this
    this.parent = this.board.game.parent
    this.moved_fire = {}
    this.sprites = {
      wall: 'dirt-',
      path: 'vine',
      animation: '',
      square: 'floor',
      floor_dxy: 'greenarrow',
      box: '',
      ash: 'ash-',
      gold: 'gold-',
    }
    this.all_divs = []
    this.hover_xys = []
    this.cache = {}
    this.names = [
      'wall',
      'path',
      'piece',
      'square',
      'item',
      'animation',
      'box',
      'fire',
      'floor_dxy',
      'ash',
      'gold',
      'room',
    ]
    this.fire_counter = 0
    this.names.forEach(name => (this.cache[name] = {}))
    this.setZoom()
  }

  setZoom = (opts = {}) => {
    this.deserialize(opts)
    this._d = Math.min(this.board.W, this.board.H, this.diameter)
    this.scale = 32

    this.dxys = []
    this.animations = []
    const dimension = _.range(this._d + (this._d % 2 ? 0 : 1))
    this.health_divisor = 1

    dimension.forEach(dx => {
      dimension.forEach(dy => {
        this.dxys.push([dx, dy])
      })
    })
    this.parent.style.fontSize = this.scale + 'px'
    this.parent.style.height = this._d - 2 * this.overflow + 'em'
    this.parent.style.width = this._d - 2 * this.overflow + 'em'

    if (!this.container) {
      this.container = uR.element.create('div', {
        parent: this.parent,
      })

      this.parent.addEventListener('mousedown', this.click)
    }

    this.moveBoard()
    this.update()
  }

  eventToXY = e => {
    const offset = this._d / 2 - this.overflow + this.offset
    const mouse_xy = [
      Math.floor(e.offsetX / this.scale - offset),
      Math.floor(e.offsetY / this.scale - offset),
    ]
    return geo.vector.add(mouse_xy, this.origin)
  }

  click = e => {
    const xy = this.eventToXY(e)
    if (this.onClick) {
      this.onClick(xy, event)
    }
    this.update()
    console.log("CLICKED:", xy, this.board.getOne('piece', xy)) // eslint-disable-line
  }

  moveBoard() {
    const { W, H } = this.board
    if (window.location.search.includes('huge')) {
      this.parent.classList.add('huge')
    }
    this.container.className = `board w-${W} h-${H}`
  }

  normalize() {
    // base parameters to normalize all sprites too
    const { player } = this.board
    if (player && this.follow_player) {
      this.origin = geo.vector.subtract(player.xy, [
        Math.floor(this._d / 2) - this.overflow,
        Math.floor(this._d / 2) - this.overflow,
      ])
      this.health_divisor = player.damage
    }
  }

  reset() {
    this.moved_fire = {}
  }

  redraw(instant) {
    this.all_divs.forEach(d => (d.className = ''))
    this.container.classList.add('no-transition')
    observer.one('animate', () => {
      this.container.classList.remove('no-transition')
    })

    // because fire is handled similarly to pieces there's a problem associated with re-using divs
    Object.values(this.cache.fire).forEach(e => e.parentNode.removeChild(e))
    this.cache.fire = {}

    const { style } = this.container
    if (!window.lock) {
      const offset = this.overflow + (this._d % 2 ? 0 : 0.5)
      const left = -this.origin[0] - offset
      const top = -this.origin[1] - offset
      style.marginLeft = `${left}em`
      style.marginTop = `${top}em`
      //window.lock = true
    }
    if (instant) {
      style.transition = '0s'
      setTimeout(() => (style.transition = null), 0)
    }

    if (this.board.game.ui) {
      this.board.game.ui.update()
    }

    if (!(this.frames && this.frames.length)) {
      return
    }

    this.frame_no = -1
    this.nextFrame()
  }

  _drawLayer(name, results = []) {
    const piece_counts = {}
    results.forEach(([xy, value], id_numbr) => {
      if (name === 'fire') {
        id_numbr = this.fire_counter++
      }
      if (name === 'piece') {
        piece_counts[value.id] = piece_counts[value.id] || 0
        id_numbr = value.id + '_' + piece_counts[value.id]++
      }
      const element = this.getDiv(name, id_numbr)

      // This is currently used in the click handler to determine clicked element
      // #! TODO remove and use click mask exclusively
      element.xy = xy

      if (name === 'piece') {
        element.piece_id = value.id
        const { last_move, dxy } = value
        value.moved = undefined
        if (last_move && last_move._from && last_move._from !== value.index) {
          value.moved = dxy.join('')
        }
        if (last_move && last_move.damages) {
          observer.one('animate', () =>
            element.classList.add(`damage-${dxy.join('')}`),
          )
        }
      }
      if (value.moved) {
        element.classList.remove(`moved-${value.moved}`)
        observer.one('animate', () => {
          element.classList.remove(`moved-${value.moved}`)
        })
      }
      element.className = this.renderOne(name)(xy, value)
      if (this.oob[xy]) {
        element.className += ' oob'
      }
      if (name === 'animation' && value.className) {
        observer.one('animate', () => element.classList.add(value.className))
      }
    })
  }

  update = () => {
    // #! TODO rename as capture
    if (!this.container || !this.board.entities) {
      return
    }
    this.normalize()
    const xy = this.origin

    // get lists of all the items to draw by entity name
    const xys = this.dxys.map(dxy => geo.vector.add(xy, dxy))
    this.oob = {}
    xys.forEach(xy => {
      if (
        !_.inRange(xy[1], this.board.MIN_X, this.board.MAX_X) ||
        !_.inRange(xy[0], this.board.MIN_Y, this.board.MAX_Y)
      ) {
        this.oob[xy] = true
      }
    })

    const results = {}
    this.frames = [results]

    this.names.forEach(name => {
      results[name] = layers[name].getResults(xys, this.board, this)
    })

    // reset animations for next time
    // #! TODO this should be in a reset method only called when each turn starts
    // otherwise animations are excluded from replayed moves
    // calls to renderer.animations.push should be refactored
    this.animations = []

    this.redraw() // #! TODO should be externally triggered
  }

  captureFrame(dirty_layers) {
    const frame = {}
    this.names.forEach(name => {
      const xys = dirty_layers[name]
      if (xys && xys.length) {
        frame[name] = layers[name].getResults(xys, this.board, this)
      }
    })
    if (this.__next) {
      frame.piece = frame.piece || []
      frame.piece.push(this.__next)
    }
    this.frames.push(frame)
  }

  nextFrame = () => {
    this.frame_no++
    const frame = this.frames[this.frame_no]
    clearTimeout(this.frame_timeout)
    if (!frame) {
      return
    }
    this.names.forEach(name => {
      frame[name] && this._drawLayer(name, frame[name])
    })
    setTimeout(() => observer.trigger('animate'), 0)
    this.frame_timeout = setTimeout(this.nextFrame, 250)
  }

  setHoverXY = xy => {
    const [hover_x, hover_y] = xy
    const dx_center = hover_x - this.origin[0]
    const dy_center = hover_y - this.origin[1]
    this.hover_xys = _.range(this.box_count).map(i => [
      hover_x - dx_center * MIRRORS[i][0],
      hover_y - dy_center * MIRRORS[i][1],
    ])
  }

  getDiv(name, index) {
    if (!this.cache[name][index]) {
      const id = `${name}-${index}`
      this.cache[name][index] = uR.element.create('div', {
        parent: this.container,
        id,
      })
      if (name !== 'fire') {
        this.all_divs.push(this.cache[name][index])
      }
      if (name === 'piece') {
        this.cache[name][index].insertAdjacentHTML(
          'afterbegin',
          '<span class="look">👀</span>',
        )
      }
    }

    return this.cache[name][index]
  }

  removePiece = piece => {
    if (!piece.health) {
      const element = this.cache.piece[piece.id]
      if (element) {
        element.classList.add('dead')
        delete this.cache.piece[piece.id]
        setTimeout(() => element.remove(), 2000)
      }
    }
  }
  renderOne = name => (xy, value) => {
    if (name === 'piece') {
      const { health, max_health } = value
      const extras = {}
      if (max_health > 1) {
        extras.health = Math.ceil(health / this.health_divisor)
        extras.health = Math.min(extras.health, 5)
      }
      return renderEntity(xy, value, extras)
    }
    if (name === 'fire') {
      return renderEntity(xy, value)
    }

    let sprite
    const dxy = value.dxy && value.dxy.join('')
    if (name === 'item') {
      sprite = value.name
    } else if (name === 'animation') {
      sprite = value.sprite
      const source = types[value.damage_source]
      if (source && source.damage_animation) {
        sprite = source.damage_animation
      }
    } else {
      sprite = layers[name].getSprite(value, this)
    }

    const opts = { w: 1, h: 1, x: xy[0], y: xy[1], sprite, dxy }

    return `square sprite ${name} ${objToClassString(opts)}`
  }
}

const objToClassString = obj => {
  const items = []
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }
    if (value === true) {
      items.push(key)
    } else {
      items.push(`${key}-${value}`)
    }
  })
  return items.join(' ')
}

// pieces and anything which is not a primative needs fancy rendering
const renderEntity = (xy, entity, extras = {}) => {
  const {
    color,
    name,
    type,
    dxy,
    follow_order,
    following,
    _sprite,
    moved,
  } = entity
  let { sprite } = types[type]
  if (_sprite) {
    sprite += _sprite
  }
  extras = {
    ...extras,
    moved,
    sprite,
    color,
    follow_order,
    following: !!following,
    dxy: dxy.join(''),
    x: xy[0],
    y: xy[1],
  }

  let className = `${name} ${type} w-1 h-1 sprite `
  className += objToClassString(extras)
  return className
}
