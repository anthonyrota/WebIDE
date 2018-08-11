import { combineOperators, IOperator } from 'src/models/Stream/IOperator'
import { scanWithInitialValue } from 'src/models/Stream/StreamOperators/scanWithInitialValue'
import { takeLast } from 'src/models/Stream/StreamOperators/takeLast'

export function reduce<T, U>(
  accumulate: (accumulatedValue: U, value: T, index: number) => U,
  initialValue: U
): IOperator<T, T> {
  return combineOperators(
    scanWithInitialValue(accumulate, initialValue),
    takeLast(1)
  )
}
