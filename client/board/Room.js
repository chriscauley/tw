import _ from 'lodash'
import geo from '../geo'

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

export const zelda = ({ room_count = 3, room_size = 9, spacing = 3 }) => {
  return _.flatten(
    _.range(room_count).map(y => {
      const y0 = y * (room_size + spacing)
      return _.range(room_count).map(x => {
        // _x is [0...room_count] or the reverse dependent on
        const _x = y % 2 ? room_count - x - 1 : x
        const x0 = _x * (room_size + spacing)
        return room({ x0, y0, W: room_size, H: room_size })
      })
    }),
  )
}

export const connectRooms = board => {
  const { rooms } = board
  const centers = rooms.map(r => r.center)
  let last_center = (board.start = centers[0])
  let xy = [...last_center]
  board.setOne('path', xy, true)

  centers.slice(1).map(center => {
    const dxys = geo.vector.iterDifference(last_center, center)
    dxys.forEach(dxy => {
      // take a step, make a path, tear down any walls
      xy = geo.vector.subtract(xy, dxy)
      board.setOne('square', xy, true)
      board.setOne('path', xy, true)
      board.setOne('wall', xy, 0)

      // check for non-squares next to path, turn them into walls
      geo.vector.splitDxy(dxy).forEach(side_dxy => {
        const xy2 = geo.vector.add(xy, side_dxy)
        if (!board.getOne('square', xy2)) {
          board.setOne('square', xy2, true)
          board.setOne('wall', xy2, 1)
        }
      })
    })

    last_center = center
  })

  // paths are done, determine their directionality
  Object.entries(board.entities.path).forEach(([i, _true]) => {
    const xy = board.i2xy(i)
    const path_connections = geo.dxy.list.map(dxy =>
      board.getOne('path', geo.vector.add(xy, dxy)) ? 1 : 0,
    )
    board.setOne('path', xy, path_connections.join(''))
  })
}

export default {
  zelda,
  connectRooms,
}
