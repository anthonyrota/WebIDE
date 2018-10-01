import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { concatMap } from 'src/models/Stream/StreamOperators/concatMap'

export function concatMapTo<T>(stream: Stream<T>): Operation<unknown, T> {
  return concatMap(() => stream)
}
