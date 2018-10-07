import { Operation, transform } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { combineLast } from 'src/models/Stream/StreamConstructors/combineLast'
import { UnwrapFromStreams } from 'src/models/Stream/types'
import { Unshift } from 'src/types/utils'

export function combineLastWith<T>(): Operation<T, [T]>
export function combineLastWith<T, U extends Array<Stream<any>>>(
  ...streams: U
): Operation<T, Unshift<UnwrapFromStreams<U>, T>>
export function combineLastWith<T>(
  ...streams: Array<Stream<T>>
): Operation<T, T[]> {
  return transform(source => combineLast(source, ...streams))
}
