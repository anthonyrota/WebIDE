import { reduce } from 'src/models/Stream/StreamOperators/reduce'
import { always } from 'src/utils/always'

export const max = always(reduce(Math.max))
