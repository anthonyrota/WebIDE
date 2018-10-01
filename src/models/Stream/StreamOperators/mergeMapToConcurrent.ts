import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { mergeMapConcurrent } from 'src/models/Stream/StreamOperators/mergeMapConcurrent'

export function mergeMapToConcurrent<T>(
  stream: Stream<T>,
  concurrency: number
): Operation<unknown, T> {
  return mergeMapConcurrent(() => stream, concurrency)
}
