import { IOperator } from 'src/models/Stream/IOperator'
import { distinctUntilChangedWithKeySelector } from 'src/models/Stream/StreamOperators/distinctUntilChangedWithKeySelector'

export function distinctUntilKeyChanged<T, K extends keyof T>(
  key: K
): IOperator<T, T> {
  return distinctUntilChangedWithKeySelector<T, T[K]>(value => value[key])
}
