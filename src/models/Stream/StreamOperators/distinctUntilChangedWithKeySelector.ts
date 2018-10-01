import { Operation } from 'src/models/Stream/Operation'
import { isReferentiallyEqual } from 'src/utils/isReferentiallyEqual'
import { distinctUntilChangedWithKeySelectorAndCompareFunction } from './distinctUntilChangedWithKeySelectorAndCompareFunction'

export function distinctUntilChangedWithKeySelector<TValue, TKey>(
  selectKey: (value: TValue) => TKey
): Operation<TValue, TValue> {
  return distinctUntilChangedWithKeySelectorAndCompareFunction(
    selectKey,
    isReferentiallyEqual
  )
}
