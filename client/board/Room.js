// #! TODO
// a square a can be in a board and a room
// the big difference between a board and a room is that the square's coordinate
// system matches the board, not the room

import _ from 'lodash'

/* A room generator should output 
   {
     W: int,
     H: int,
     squares: [{x,y,wall},...]
   }
*/

const room = ({
  W, // width
  H, // height
  x0 = 0, // offset x
  y0 = 0, // offset y
}) => {
  const x_min = x0
  const x_max = W + x0 - 1
  const y_min = y0
  const y_max = H + y0 - 1
  const walls = []
  const xys = []
  _.range(y0, y0 + H).forEach(y => {
    const edge_y = y === y_min || y === y_max
    _.range(x0, x0 + W).forEach(x => {
      const xy = [x, y]
      xys.push(xy)
      if (edge_y || x === x_min || x === x_max) {
        walls.push(xy)
      }
    })
  })
  const center = xys[Math.floor(xys.length / 2)]
  return { xys, walls, x_max, y_max, center }
}

/* eslint-disable */
const printRoom = ({
  xys,
  walls,
  x_max,
  y_max,
  W,
  H,
}) => {
  const rows = _.range(H || y_max + 1).map(
    y => _.range(W || x_max + 1).map(
      x => " "
    )
  )

  walls.map(([x,y]) => rows[y][x] = 1)

  let output = rows.map(
    row => row.join(" ")
  ).join("\n")
  console.log(output)
}

//printRoom(room({ W: 4, H: 4, x0: 5, y0: 2 }))
/* eslint-enable */

export const zelda = ({ room_count = 1, room_size = 6, spacing = 1 }) => {
  return _.range(room_count).map(i => {
    const x0 = i * (room_size + spacing)
    const y0 = 0
    return room({ x0, y0, W: room_size, H: room_size })
  })
}

export default {
  zelda,
}
