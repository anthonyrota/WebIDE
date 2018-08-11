import { combineOperators, IOperator } from 'src/models/Stream/IOperator'
import { takeLast } from 'src/models/Stream/StreamOperators/takeLast'
import { throwIfEmpty } from 'src/models/Stream/StreamOperators/throwIfEmpty'

export function last<T>(): IOperator<T, T> {
  return combineOperators(
    takeLast(1),
    throwIfEmpty(new Error('[FirstOperator] No value was emitted'))
  )
}
