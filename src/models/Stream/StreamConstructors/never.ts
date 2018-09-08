import { RawStream } from 'src/models/Stream/Stream'
import { always } from 'src/utils/always'
import { noop } from 'src/utils/noop'

export const never = always(new RawStream<never>(noop))
