import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { mergeMapConcurrent } from 'src/models/Stream/StreamOperators/mergeMapConcurrent'
import { identity } from 'src/utils/identity'

export function mergeAllConcurrent<T>(
  concurrency: number
): Operation<Stream<T>, T> {
  return mergeMapConcurrent(identity, concurrency)
}
