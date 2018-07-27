import { Stream } from 'src/models/Stream/Stream'
import { fromArray } from 'src/models/Stream/StreamConstructors/fromArray'

export function of<T>(...values: T[]): Stream<T> {
  return fromArray<T>(values)
}
