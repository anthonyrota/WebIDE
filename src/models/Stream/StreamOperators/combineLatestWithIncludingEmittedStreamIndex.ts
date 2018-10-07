import { Operation, transform } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import {
  combineLatestIncludingEmittedStreamIndex,
  IValuesWithEmittedStreamIndex
} from 'src/models/Stream/StreamConstructors/combineLatestIncludingEmittedStreamIndex'
import { UnwrapFromStreams } from 'src/models/Stream/types'
import { Unshift } from 'src/types/utils'

export function combineLatestWithIncludingEmittedStreamIndex<T>(): Operation<
  T,
  IValuesWithEmittedStreamIndex<[T]>
>
export function combineLatestWithIncludingEmittedStreamIndex<
  T,
  U extends Array<Stream<any>>
>(
  ...streams: U
): Operation<T, IValuesWithEmittedStreamIndex<Unshift<UnwrapFromStreams<U>, T>>>
export function combineLatestWithIncludingEmittedStreamIndex<T>(
  ...streams: Array<Stream<T>>
): Operation<T, IValuesWithEmittedStreamIndex<T[]>> {
  return transform(source =>
    combineLatestIncludingEmittedStreamIndex(source, ...streams)
  )
}
