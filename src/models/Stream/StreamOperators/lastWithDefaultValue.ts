import { combineOperators, IOperator } from 'src/models/Stream/IOperator'
import { defaultIfEmpty } from 'src/models/Stream/StreamOperators/defaultIfEmpty'
import { takeLast } from 'src/models/Stream/StreamOperators/takeLast'

export function lastWithDefaultValue<T>(defaultValue: T): IOperator<T, T> {
  return combineOperators(takeLast(1), defaultIfEmpty(defaultValue))
}
