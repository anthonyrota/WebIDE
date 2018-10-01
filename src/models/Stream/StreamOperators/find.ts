import { combineOperators, Operation } from 'src/models/Stream/Operation'
import { findValueAndIndex } from './findValueAndIndex'
import { pluck } from './pluck'

export function find<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, T>
export function find<T, U extends T>(
  predicate: (value: T, index: number) => value is U
): Operation<T, U>
export function find<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, T> {
  return combineOperators(findValueAndIndex(predicate), pluck('value'))
}
