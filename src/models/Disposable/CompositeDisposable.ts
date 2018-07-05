import { Disposable } from 'src/models/Disposable/Disposable'
import { emptyDisposable } from 'src/models/Disposable/emptyDisposable'
import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposable } from 'src/models/Disposable/IDisposable'

export class CompositeDisposable implements IConsciousDisposable {
  private __isActive: boolean
  private __disposables: Set<IDisposable>

  constructor(values?: IDisposable[]) {
    this.__isActive = true
    this.__disposables = new Set(values)
  }

  public addDisposable(disposable: IDisposable): void {
    if (this.__isActive) {
      this.__disposables.add(disposable)
    } else {
      disposable.dispose()
    }
  }

  public addDisposableAndReturnSubscription(
    disposable: IDisposable
  ): IConsciousDisposable {
    if (this.__isActive) {
      this.__disposables.add(disposable)
      return new Disposable(() => this.removeDisposable(disposable))
    } else {
      disposable.dispose()
      return emptyDisposable
    }
  }

  public removeDisposable(disposable: IDisposable): void {
    if (this.__isActive) {
      this.__disposables.delete(disposable)
    }
  }

  public clearDisposables(): void {
    if (this.__isActive) {
      this.__disposables.clear()
    }
  }

  public dispose(): void {
    this.__disposables.forEach(disposable => {
      disposable.dispose()
    })
    this.__disposables.clear()
    this.__isActive = false
  }

  public isActive(): boolean {
    return this.__isActive
  }
}
