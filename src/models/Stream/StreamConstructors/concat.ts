import { Stream } from 'src/models/Stream/Stream'
import { fromArray } from 'src/models/Stream/StreamConstructors/fromArray'
import { concatAll } from 'src/models/Stream/StreamOperators/concatAll'

export function concat<T>(...streams: Array<Stream<T>>): Stream<T> {
  return fromArray(streams).lift(concatAll())
}
