import { Operation } from 'src/models/Stream/Operation'
import { distinctUntilChangedWithKeySelectorAndCompareFunction } from 'src/models/Stream/StreamOperators/distinctUntilChangedWithKeySelectorAndCompareFunction'

export function distinctUntilKeyChangedWithCompareFunction<
  T,
  K extends keyof T
>(key: K, isEqual: (a: T[K], b: T[K]) => boolean): Operation<T, T> {
  return distinctUntilChangedWithKeySelectorAndCompareFunction<T, T[K]>(
    value => value[key],
    isEqual
  )
}
