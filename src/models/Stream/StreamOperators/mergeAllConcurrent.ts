import { IOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { mergeMapConcurrent } from 'src/models/Stream/StreamOperators/mergeMapConcurrent'
import { identity } from 'src/utils/identity'

export function mergeAllConcurrent<T>(
  concurrency: number
): IOperator<Stream<T>, T> {
  return mergeMapConcurrent(identity, concurrency)
}
