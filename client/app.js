import uR from 'unrest.io'

import './routes'
import './geo'
import slicer from './slicer'

uR.auth.enabled = false
uR.ready(() => {
  uR.admin.start()
  slicer.Sheet.__makeMeta()
})
