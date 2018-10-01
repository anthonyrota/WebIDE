import { Operation } from '../Operation'
import { findIndex } from './findIndex'

export function findIndexOfValue<T>(targetValue: T): Operation<T, number> {
  return findIndex(value => value === targetValue)
}
