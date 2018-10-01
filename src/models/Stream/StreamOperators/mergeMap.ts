import { Stream } from 'src/models/Stream/Stream'
import { Operation } from '../Operation'
import { mergeScan } from './mergeScan'

export function mergeMap<T, U>(
  convertValueToStream: (value: T, index: number) => Stream<U>
): Operation<T, U> {
  return mergeScan<T, U, null>(
    (_, value, index) => convertValueToStream(value, index),
    null
  )
}
