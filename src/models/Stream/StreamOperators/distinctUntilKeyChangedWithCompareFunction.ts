import { IOperator } from 'src/models/Stream/IOperator'
import { distinctUntilChangedWithKeySelectorAndCompareFunction } from 'src/models/Stream/StreamOperators/distinctUntilChangedWithKeySelectorAndCompareFunction'

export function distinctUntilKeyChangedWithCompareFunction<
  T,
  K extends keyof T
>(key: K, isEqual: (a: T[K], b: T[K]) => boolean): IOperator<T, T> {
  return distinctUntilChangedWithKeySelectorAndCompareFunction<T, T[K]>(
    value => value[key],
    isEqual
  )
}
