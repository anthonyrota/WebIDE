import { IDisposable } from 'src/models/Disposable/IDisposable'
import { isDisposable } from 'src/models/Disposable/isDisposable'
import { isCallable } from 'src/utils/isCallable'

export type DisposableLike = IDisposable | (() => void) | void

export function disposeDisposableLike(disposableLike: DisposableLike): void {
  if (isDisposable(disposableLike)) {
    disposableLike.dispose()
  } else if (isCallable(disposableLike)) {
    disposableLike()
  }
}
