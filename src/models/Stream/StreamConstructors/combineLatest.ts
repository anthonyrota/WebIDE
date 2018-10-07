import { ToTuple } from 'src/types/utils'
import { Stream } from '../Stream'
import { pluck } from '../StreamOperators/pluck'
import { UnwrapFromStreams } from '../types'
import { combineLatestIncludingEmittedStreamIndex } from './combineLatestIncludingEmittedStreamIndex'

export function combineLatest(): Stream<never>
export function combineLatest<T extends Array<Stream<any>>>(
  ...streams: T
): Stream<ToTuple<UnwrapFromStreams<T>>>
export function combineLatest<T>(...streams: Array<Stream<T>>): Stream<T[]> {
  return combineLatestIncludingEmittedStreamIndex(...streams).lift(
    pluck('values')
  )
}
