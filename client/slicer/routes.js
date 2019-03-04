import uR from 'unrest.io'

uR.router.add({
  '#/slicer/(\\d+)/$': uR.router.routeElement('ur-slicer'),
  '#/slicer/sheet/(\\d+)/$': uR.router.routeElement('ur-sheet'),
  '#/slicer/composite/': uR.router.routeElement('ur-composite-list'),
})
