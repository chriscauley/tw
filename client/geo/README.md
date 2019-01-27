# tW.geo

This is a collection of the geometry constants and utilities for timewalker. For consistency sake, it is always prefered that points (`[x,y]` arrays, aka `xy` or `xys` in plural) are passed around as vectors rather than separate integers. If it is a direction it should be refered to as `dxy` (like in calculus) or `dxys` in plural and take the form `[dx,dy]` where `dx` and `dy` are integers, typically one of `-1, 0, 1`. Internally functions may destructure and refer to their components individually, but should always return a vector or an array of vectors.

## `tW.geo.dxy`

A constants for refering to directions. Currently it only supports normal directions (pointing up, down, left, and right) but may eventually be expanded to longer normals and diagonals.

``` javascript
// getSurroundingPoints get the coordinates of the squares up, down, left, right of a point
const getSurroundingPoints = ([x,y]) => {
  geo.dxy.list.map( ([dx,dy]) =>
    [ x + dx, y + dy ]
  )
}
```
