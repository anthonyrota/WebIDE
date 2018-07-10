import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'

export class Disposable implements IConsciousDisposable {
  private __isActive: boolean
  private __dispose?: () => void

  constructor(dispose?: () => void) {
    this.__isActive = true
    if (dispose) {
      this.__dispose = dispose
    }
  }

  public dispose(): void {
    this.__isActive = false
    if (this.__dispose) {
      this.__dispose()
    }
    this._afterDisposed()
  }

  public isActive(): boolean {
    return this.__isActive
  }

  protected _afterDisposed(): void {}
}
