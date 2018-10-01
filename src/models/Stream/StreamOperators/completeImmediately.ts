import { operateOnTarget } from 'src/models/Stream/Operation'
import { always } from 'src/utils/always'

export const completeImmediately = always(
  operateOnTarget<unknown>(target => target.complete())
)
