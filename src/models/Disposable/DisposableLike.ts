import { IDisposable } from 'src/models/Disposable/IDisposable'
import { isDisposable } from 'src/models/Disposable/isDisposable'
import { isFunction } from 'src/utils/isFunction'

export type DisposableLike = IDisposable | (() => void) | void

export function disposeDisposableLike(disposableLike: DisposableLike): void {
  if (isDisposable(disposableLike)) {
    disposableLike.dispose()
  } else if (isFunction(disposableLike)) {
    disposableLike()
  }
}
