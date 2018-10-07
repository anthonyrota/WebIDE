import { combineOperators, Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { combineAllWithEmittedStreamIndex } from './combineAllWithEmittedStreamIndex'
import { pluck } from './pluck'

export function combineAll<T>(): Operation<Stream<T>, T[]> {
  return combineOperators(combineAllWithEmittedStreamIndex(), pluck('values'))
}
