import { Operation } from 'src/models/Stream/Operation'
import { identity } from 'src/utils/identity'
import { isReferentiallyEqual } from 'src/utils/isReferentiallyEqual'
import { distinctUntilChangedWithKeySelectorAndCompareFunction } from './distinctUntilChangedWithKeySelectorAndCompareFunction'

export function distinctUntilChangedWithCompareFunction<T>(
  isEqual: (lastValue: T, newValue: T) => boolean
): Operation<T, T> {
  return distinctUntilChangedWithKeySelectorAndCompareFunction(
    identity,
    isReferentiallyEqual
  )
}
