import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'

export class Disposable implements IConsciousDisposable {
  private __isActive: boolean
  private __dispose: () => void

  constructor(dispose: () => void) {
    this.__isActive = true
    this.__dispose = dispose
  }

  public dispose(): void {
    this.__isActive = false
    this.__dispose()
  }

  public isActive(): boolean {
    return this.__isActive
  }
}
