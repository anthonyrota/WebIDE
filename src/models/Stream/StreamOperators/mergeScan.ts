import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { mergeScanConcurrent } from './mergeScanConcurrent'

export function mergeScan<T, U, A>(
  accumulate: (accumulatedValue: U | A, value: T, index: number) => Stream<U>,
  startingValue: U | A
): Operation<T, U> {
  return mergeScanConcurrent<T, U, A>(accumulate, startingValue, Infinity)
}
