import { ZERO } from '../geo/vector'
import after from './after'

export default (piece, move, _dxy) => after(move, () => (piece.dxy = ZERO))
