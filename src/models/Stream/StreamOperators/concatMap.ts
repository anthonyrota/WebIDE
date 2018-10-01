import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { concatScan } from './concatScan'

export function concatMap<T, U>(
  convertValueToStream: (value: T, index: number) => Stream<U>
): Operation<T, U> {
  return concatScan<T, U, null>(
    (_, value, index) => convertValueToStream(value, index),
    null
  )
}
