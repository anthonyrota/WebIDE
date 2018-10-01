import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { concatMap } from 'src/models/Stream/StreamOperators/concatMap'
import { identity } from 'src/utils/identity'

export function concatAll<T>(): Operation<Stream<T>, T> {
  return concatMap(identity)
}
