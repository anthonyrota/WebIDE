import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { expandMapConcurrent } from './expandMapConcurrent'

export function expandMap<T>(
  convertValueToStream: (value: T, index: number) => Stream<T>
): Operation<T, T> {
  return expandMapConcurrent(convertValueToStream, Infinity)
}
