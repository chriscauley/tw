import uR from 'unrest.io'
import './geo/preview.tag'

uR.router.add({
  "^#/look-preview/$": uR.router.routeElement("look-preview"),
})