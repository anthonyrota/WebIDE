import { combineOperators, Operation } from 'src/models/Stream/Operation'
import { defaultIfEmpty } from 'src/models/Stream/StreamOperators/defaultIfEmpty'
import { scanWithInitialValue } from 'src/models/Stream/StreamOperators/scanWithInitialValue'
import { takeLast } from 'src/models/Stream/StreamOperators/takeLast'

export function reduceWithInitialValue<T, U, I = U>(
  accumulate: (accumulatedValue: U | I, value: T, index: number) => U,
  initialValue: U | I
): Operation<T, U> {
  return combineOperators(
    scanWithInitialValue<T, U, I>(accumulate, initialValue),
    takeLast(1),
    defaultIfEmpty(initialValue)
  )
}
