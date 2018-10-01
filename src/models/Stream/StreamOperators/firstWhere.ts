import { combineOperators, Operation } from 'src/models/Stream/Operation'
import { filter } from './filter'
import { first } from './first'

export function firstWhere<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, T> {
  return combineOperators(filter(predicate), first())
}
