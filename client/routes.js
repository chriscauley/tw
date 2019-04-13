import uR from 'unrest.io'

import board_routes from './board/routes'
import './geo/preview.tag'

uR.router.add({
  '^#/look-preview/$': uR.router.routeElement('look-preview'),
})

uR.router.add(board_routes)
