import { Stream } from 'src/models/Stream/Stream'
import { race } from 'src/models/Stream/StreamConstructors/race'
import { Operation, transform } from '../Operation'

export function raceWith<T>(...streams: Array<Stream<T>>): Operation<T, T> {
  return transform(source => race(source, ...streams))
}
