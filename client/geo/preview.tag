import _ from 'lodash'
import uR from 'unrest.io'

import geo from './index'

/*  this.grids = []
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
    })*/

const LookPreview = {
  init: function() {
    this.data = { geometry: 'line' }
    this.grids = [{
      dxy: 'derp',
      rows: [
        [1,1,1,1,1],
        [1,1,1,1,1],
      ],
    }]
    console.log(this.grids)
    this.schema = {
      range: { choices: _.range(1,5) },
      geometry: {
        choices: geo.look.ALL_GEOMETRIES,
      },
    }
    this.on("mount", () => this.update())
    this.on("update",() => {
      /*const range = parseInt(this.data.range)
      const one_row = _.range(8).map( z => ({ color: "" }) )
      this.grids = geo.look.DIRECTIONS.map( () => {
        const rows = one_row.map
      })*/
    })
  }
}

<look-preview>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <h3>{ data.geometry }</h3>
      <div class="grids">
        <div class="grid" each={ grid in grids }>
          <h4>
            { grid.dxy }
          </h4>
          <ur-table rows={grid.rows}>
        </div>
      </div>
      <ur-form initial={ initial } autosubmit=true schema={schema}></ur-form>
    </div>
  </div>
  <script>
this.mixin(uR.css.ThemeMixin)
this.mixin(LookPreview)

/*submit(form_tag) {
  this.data = form_tag.getData()
  this.update()
}
this.initial = this.data = {
  range: 1,
  geometry: 'line',
}
this.schema = [
]
this.on("mount",() => {
  this.update()
})
this.on("update", () => {
  }
})*/
  </script>
</look-preview>
