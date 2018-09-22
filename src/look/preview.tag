<look-preview>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <h3>{ this.data.geometry }</h3>
      <div class="grids">
        <div class="grid" each={ grid in grids }>
          <h4>
            { grid.dxdy }
          </h4>
          <div class="board">
            <div class="row" each={ row in grid.rows }>
              <div each={ box in row } class="box { box.className }"
                   style="background-color: { box.color }"></div>
            </div>
          </div>
        </div>
      </div>
      <ur-form initial={ initial } autosubmit=true></ur-form>
    </div>
  </div>
  <script>
submit(form_tag) {
  this.data = form_tag.getData()
  this.update()
}
this.initial = this.data = {
  range: 1,
  geometry: 'line',
}
this.schema = [
  { name: "range", choices: ['1','2','3'], type: "select"},
  { name: "geometry",
    choices: tW.look.GEOMETRIES.concat(tW.look._GEOMETRIES),
    type: 'select',
  },
]
this.on("mount",() => {
  this.update()
})
this.on("update", () => {
  const range = parseInt(this.data.range)
  this.grids = []
  const one_row = uR.math.zeros(2*range+1).map( z => ({ color: "" }) )
  for (let dxdy of tW.look.DIRECTIONS) {
    let rows = []
    for (let ir=0;ir<2*range+1;ir++) {
      rows.push(one_row.slice())
    }
    for (let delta of tW.look[this.data.geometry][dxdy][range]) {
      rows[delta[0]+range][delta[1]+range] = { color: 'red' }
    }
    rows[range][range] = { color: "gray", className: `fa fa-arrow-${tW.look.DIR2NAME[dxdy]}` }
    this.grids.push({
      dxdy: dxdy,
      rows: rows,
    })
  }
})
  </script>
  <style>
.grids {
  width: 600px;
}
.board, .row, .grids {
  display: flex;
}
.row {
  flex-direction: column;
}
.box {
  border: 1px solid black;
  height: 25px;
  line-height: 25px;
  text-align: center;
  width: 25px;
}
.board {
  border: 4px double #888;
}
:scope ur-form form {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
:scope ur-form form > * { flex-basis: unset !important; }
  </style>
</look-preview>

uR.router.add({
  "^#!/look-preview/$": uR.router.routeElement("look-preview"),
})