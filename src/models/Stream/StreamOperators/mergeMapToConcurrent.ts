import { IOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { mergeMapConcurrent } from 'src/models/Stream/StreamOperators/mergeMapConcurrent'

export function mergeMapToConcurrent<T>(
  stream: Stream<T>,
  concurrency: number
): IOperator<unknown, T> {
  return mergeMapConcurrent(() => stream, concurrency)
}
