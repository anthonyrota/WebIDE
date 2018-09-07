import { combineOperators, IOperator } from 'src/models/Stream/IOperator'
import { defaultIfEmpty } from 'src/models/Stream/StreamOperators/defaultIfEmpty'
import { scanWithInitialValue } from 'src/models/Stream/StreamOperators/scanWithInitialValue'
import { takeLast } from 'src/models/Stream/StreamOperators/takeLast'

export function reduceWithInitialValue<T, U>(
  accumulate: (accumulatedValue: U, value: T, index: number) => U,
  initialValue: U
): IOperator<T, U> {
  return combineOperators(
    scanWithInitialValue(accumulate, initialValue),
    takeLast(1),
    defaultIfEmpty(initialValue)
  )
}
