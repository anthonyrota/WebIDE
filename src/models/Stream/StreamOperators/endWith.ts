import { Operation } from '../Operation'
import { fromArray } from '../StreamConstructors/fromArray'
import { concatWith } from './concatWith'

export function endWith<T>(...values: T[]): Operation<T, T> {
  return concatWith(fromArray(values))
}
