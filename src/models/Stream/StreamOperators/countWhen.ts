import { combineOperators, Operation } from 'src/models/Stream/Operation'
import { count } from './count'
import { filter } from './filter'

export function countWhen<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, number> {
  return combineOperators(filter(predicate), count())
}
