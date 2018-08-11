import { Stream } from 'src/models/Stream/Stream'
import { fromArray } from 'src/models/Stream/StreamConstructors/fromArray'
import { mergeAll } from 'src/models/Stream/StreamOperators/mergeAll'

export function merge<T>(...sources: Array<Stream<T>>): Stream<T> {
  return fromArray(sources).lift(mergeAll())
}
