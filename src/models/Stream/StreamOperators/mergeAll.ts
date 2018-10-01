import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { mergeMap } from 'src/models/Stream/StreamOperators/mergeMap'
import { identity } from 'src/utils/identity'

export function mergeAll<T>(): Operation<Stream<T>, T> {
  return mergeMap(identity)
}
