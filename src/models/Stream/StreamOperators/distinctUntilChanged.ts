import { isReferentiallyEqual } from 'src/utils/isReferentiallyEqual'
import { Operation } from '../Operation'
import { distinctUntilChangedWithCompareFunction } from './distinctUntilChangedWithCompareFunction'

export function distinctUntilChanged<T>(): Operation<T, T> {
  return distinctUntilChangedWithCompareFunction(isReferentiallyEqual)
}
