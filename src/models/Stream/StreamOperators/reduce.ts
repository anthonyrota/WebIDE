import { combineOperators, IOperator } from 'src/models/Stream/IOperator'
import { scan } from 'src/models/Stream/StreamOperators/scan'
import { takeLast } from 'src/models/Stream/StreamOperators/takeLast'

export function reduce<T>(
  accumulate: (accumulatedValue: T, value: T, index: number) => T
): IOperator<T, T> {
  return combineOperators(
    scan<T>((a, b, index) => accumulate(a, b, index + 1)),
    takeLast(1)
  )
}
