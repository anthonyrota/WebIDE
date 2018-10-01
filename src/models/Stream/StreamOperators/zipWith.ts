import { Operation, transform } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { zip } from 'src/models/Stream/StreamConstructors/zip'
import { UnwrapFromStreams } from 'src/models/Stream/types'
import { Unshift } from 'src/types/utils'

export function zipWith<T>(): Operation<T, [T]>
export function zipWith<T, U extends Array<Stream<any>>>(
  ...streams: U
): Operation<T, Unshift<UnwrapFromStreams<U>, T>>
export function zipWith<T>(...streams: Array<Stream<T>>): Operation<T, T[]> {
  return transform(source => zip(source, ...streams))
}
