import { IDisposable } from 'src/models/Disposable/IDisposable'

export function isDisposable(value: any): value is IDisposable {
  return value && typeof value.dispose === 'function'
}
