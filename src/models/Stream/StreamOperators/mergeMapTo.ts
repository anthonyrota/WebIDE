import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { mergeMap } from 'src/models/Stream/StreamOperators/mergeMap'

export function mergeMapTo<T>(stream: Stream<T>): Operation<unknown, T> {
  return mergeMap(() => stream)
}
