import { Operation, transform } from '../Operation'
import { concat } from '../StreamConstructors/concat'
import { fromArray } from '../StreamConstructors/fromArray'

export function startWith<T>(...values: T[]): Operation<T, T> {
  return transform(source => concat(fromArray(values), source))
}
