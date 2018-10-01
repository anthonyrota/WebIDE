import { combineOperators, Operation } from 'src/models/Stream/Operation'
import { findValueAndIndex } from './findValueAndIndex'
import { pluck } from './pluck'

export function findIndex<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, number> {
  return combineOperators(findValueAndIndex(predicate), pluck('index'))
}
