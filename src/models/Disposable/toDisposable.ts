import { Disposable } from 'src/models/Disposable/Disposable'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { isDisposable } from 'src/models/Disposable/isDisposable'
import { Maybe } from 'src/models/Maybe/Maybe'

export function toDisposable(value: any): Maybe<IDisposable> {
  return isDisposable(value)
    ? Maybe.some(value)
    : typeof value === 'function'
      ? Maybe.some(new Disposable(value))
      : Maybe.none()
}
