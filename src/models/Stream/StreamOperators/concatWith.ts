import { Operation, transform } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { concat } from 'src/models/Stream/StreamConstructors/concat'

export function concatWith<T>(...streams: Array<Stream<T>>): Operation<T, T> {
  return transform(source => concat(source, ...streams))
}
