import { combineOperators, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import {
  combineLatestIncludingEmittedStreamIndex,
  IValuesWithEmittedStreamIndex
} from '../StreamConstructors/combineLatestIncludingEmittedStreamIndex'
import { switchMap } from './switchMap'
import { toArray } from './toArray'

export function combineAllWithEmittedStreamIndex<T>(): Operation<
  Stream<T>,
  IValuesWithEmittedStreamIndex<T[]>
> {
  return combineOperators(
    toArray(),
    switchMap(streams => combineLatestIncludingEmittedStreamIndex(...streams))
  )
}
