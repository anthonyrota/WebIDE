import { Operation } from '../Operation'
import { map } from './map'

export function spreadMap<T extends any[], U>(
  project: (...values: T) => U
): Operation<T, U> {
  return map(values => project(...values))
}
