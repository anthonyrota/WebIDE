import { IDisposable } from 'src/models/Disposable/IDisposable'
import { isCallable } from 'src/utils/isCallable'

export function isDisposable(value: any): value is IDisposable {
  return value != null && isCallable(value.dispose)
}
