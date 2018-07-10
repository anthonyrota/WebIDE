import { Disposable } from 'src/models/Disposable/Disposable'
import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposable } from 'src/models/Disposable/IDisposable'

class CombinedDisposable extends Disposable {
  private __disposables: IDisposable[]

  constructor(disposables: IDisposable[]) {
    super()
    this.__disposables = disposables
  }

  protected _onAfterDisposed(): void {
    for (let i = 0; i < this.__disposables.length; i++) {
      this.__disposables[i].dispose()
    }
  }
}

export function combineDisposables(
  ...disposables: IDisposable[]
): IConsciousDisposable {
  return new CombinedDisposable(disposables)
}
