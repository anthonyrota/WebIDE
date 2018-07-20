import { RawStream } from 'src/models/Stream/Stream'
import { always } from 'src/utils/always'

export const empty = always(
  new RawStream<never>(target => {
    target.complete()
  })
)
