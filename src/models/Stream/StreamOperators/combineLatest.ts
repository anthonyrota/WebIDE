import { Operation, transform } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { combineLatest } from 'src/models/Stream/StreamConstructors/combineLatest'
import { UnwrapFromStreams } from 'src/models/Stream/types'
import { Unshift } from 'src/types/utils'

export function combineLatestWith<T>(): Operation<T, [T]>
export function combineLatestWith<T, U extends Array<Stream<any>>>(
  ...streams: U
): Operation<T, Unshift<UnwrapFromStreams<U>, T>>
export function combineLatestWith<T>(
  ...streams: Array<Stream<T>>
): Operation<T, T[]> {
  return transform(source => combineLatest(source, ...streams))
}
