import { Stream } from 'src/models/Stream/Stream'
import { UnwrapFromStreams } from 'src/models/Stream/types'
import { ToTuple } from 'src/types/utils'
import { last } from '../StreamOperators/last'
import { combineLatest } from './combineLatest'

export function combineLast(): Stream<never>
export function combineLast<T extends Array<Stream<any>>>(
  ...streams: T
): Stream<ToTuple<UnwrapFromStreams<T>>>
export function combineLast<T>(...streams: Array<Stream<T>>): Stream<T[]> {
  return combineLatest(...streams).lift(last())
}
