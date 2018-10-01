import { Operation } from 'src/models/Stream/Operation'
import { distinctUntilChangedWithKeySelector } from 'src/models/Stream/StreamOperators/distinctUntilChangedWithKeySelector'

export function distinctUntilKeyChanged<T, K extends keyof T>(
  key: K
): Operation<T, T> {
  return distinctUntilChangedWithKeySelector<T, T[K]>(value => value[key])
}
