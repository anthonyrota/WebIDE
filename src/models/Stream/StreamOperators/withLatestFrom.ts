import { combineOperators, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { combineLatestWithIncludingEmittedStreamIndex } from 'src/models/Stream/StreamOperators/combineLatestWithIncludingEmittedStreamIndex'
import { UnwrapFromStreams } from 'src/models/Stream/types'
import { Unshift } from 'src/types/utils'
import { filter } from './filter'
import { pluck } from './pluck'

export function withLatestFrom<T>(): Operation<T, [T]>
export function withLatestFrom<T, U extends Array<Stream<any>>>(
  ...streams: U
): Operation<T, Unshift<UnwrapFromStreams<U>, T>>
export function withLatestFrom<T>(
  ...streams: Array<Stream<T>>
): Operation<T, T[]> {
  return combineOperators(
    combineLatestWithIncludingEmittedStreamIndex(...streams),
    filter(({ emittedStreamIndex }) => emittedStreamIndex === 0),
    pluck('values')
  )
}
