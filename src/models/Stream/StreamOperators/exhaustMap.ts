import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { exhaustScan } from './exhaustScan'

export function exhaustMap<T, U>(
  convertValueToStream: (value: T, index: number) => Stream<U>
): Operation<T, U> {
  return exhaustScan<T, U, null>(
    (_, value, index) => convertValueToStream(value, index),
    null
  )
}
