import { IDisposable } from 'src/models/Disposable/IDisposable'
import { isFunction } from 'src/utils/isFunction'

export function isDisposable(value: any): value is IDisposable {
  return value != null && isFunction(value.dispose)
}
