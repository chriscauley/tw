// this will eventually be a ur-canvas library

export const loadImage = src => {
  if (loadImage.cache[src]) {
    return Promise.resolve(loadImage.cache[src])
  }
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      loadImage.cache[src] = img
      resolve(img)
    }
    img.onerror = () => resolve({ status: 'error', img })

    img.src = src
  })
}

loadImage.cache = {}

export const changePixel = (canvas, { x, y, color }) => {
  const ctx = canvas.getContext('2d')
  const id = ctx.createImageData(1, 1)
  id.data.forEach((_, i) => (id.data[i] = color[i]))
  ctx.putImageData(id, x, y)
}

export const fillBucket = (
  canvas,
  { color_distance = 0, x, y, color = [0, 0, 0, 0], log },
) => {
  const { width, height } = canvas
  const context = canvas.getContext('2d')

  const pixel_stack = [[x, y]]

  const color_layer = context.getImageData(0, 0, width, height)
  const cld = color_layer.data

  const final_layer = context.getImageData(0, 0, width, height)
  const fld = final_layer.data
  let i = fld.length
  while (i--) {
    fld[i] = 0
  }

  // filling alternative aplha not supported yet
  // const final_alpha = color[4]
  color[4] = 255

  let pixel_position = 4 * (y * width + x)
  function getColor(data, p) {
    return [data[p], data[p + 1], data[p + 2], data[p + 3]]
  }
  function sameColor(c1, c2) {
    return (
      c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3]
    )
  }
  function diffColor(c1, c2) {
    return (
      c1[0] !== c2[0] || c1[1] !== c2[1] || c1[2] !== c2[2] || c1[3] !== c2[3]
    )
  }
  const target_color = getColor(cld, pixel_position)

  const ds2 = Math.pow((color_distance / 100) * 256, 2) // color threshold distance (squared)
  let matchColorDistance = (c1, c2) => {
    // ds1: magintude difference between two target color and pixel color (squared)
    const ds1 =
      Math.pow(c2[0] - c1[0], 2) +
      Math.pow(c2[1] - c1[1], 2) +
      Math.pow(c2[2] - c1[2], 2) +
      Math.pow(c2[3] - c1[3], 2)
    return !isNaN(ds1) && ds1 <= ds2
  }

  if (ds2 === 0) {
    // if we're not measuring color distance, diffColor is ~5% faster
    matchColorDistance = function(c1, c2) {
      return !diffColor(c1, c2)
    }
  }
  let steps = 0,
    pixels = 0
  const start_time = new Date().valueOf()
  while (pixel_stack.length) {
    steps++
    ;[x, y] = pixel_stack.pop()
    pixel_position = 4 * (y * width + x)
    const node_color = getColor(cld, pixel_position)
    if (!matchColorDistance(node_color, target_color)) {
      continue
    }
    // this next line only matters if color and target_color are within the matchColorDistance
    if (sameColor(node_color, color)) {
      return
    }
    pixels += 1
    cld[pixel_position] = color[0]
    cld[pixel_position + 1] = color[1]
    cld[pixel_position + 2] = color[2]
    cld[pixel_position + 3] = color[3]
    fld[pixel_position] = color[0]
    fld[pixel_position + 1] = color[1]
    fld[pixel_position + 2] = color[2]
    fld[pixel_position + 3] = color[3]

    if (x !== 0) {
      pixel_stack.push([x - 1, y])
    }
    if (x !== width - 1) {
      pixel_stack.push([x + 1, y])
    }
    if (y !== 0) {
      pixel_stack.push([x, y - 1])
    }
    if (y !== height - 1) {
      pixel_stack.push([x, y + 1])
    }
  }
  const ms = new Date().valueOf() - start_time
  log && log(`Filled ${pixels} pixels in ${steps} steps and ${ms} ms`)
  context.clearRect(0, 0, width, height)
  context.putImageData(color_layer, 0, 0)
}
