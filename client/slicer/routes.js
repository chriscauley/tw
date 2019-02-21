import uR from 'unrest.io'
import './slicer.tag'

uR.router.add({
  '#/slicer/(\\d+)/$': uR.router.routeElement('ur-slicer'),
  '#/slicer/sheet/(\\d+)/$': uR.router.routeElement('ur-sheet'),
})
