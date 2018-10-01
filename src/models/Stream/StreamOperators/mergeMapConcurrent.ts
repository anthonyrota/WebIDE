import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { mergeScanConcurrent } from './mergeScanConcurrent'

export function mergeMapConcurrent<T, U>(
  convertValueToStream: (value: T, index: number) => Stream<U>,
  concurrency: number
): Operation<T, U> {
  return mergeScanConcurrent<T, U, null>(
    (_, value, index) => convertValueToStream(value, index),
    null,
    concurrency
  )
}
