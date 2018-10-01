import { Operation, transform } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { merge } from 'src/models/Stream/StreamConstructors/merge'

export function mergeWith<T>(...streams: Array<Stream<T>>): Operation<T, T> {
  return transform(source => merge(source, ...streams))
}
