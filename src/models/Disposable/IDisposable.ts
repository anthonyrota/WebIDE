export interface IDisposable {
  dispose(): void
}

export class Disposable implements IDisposable {
  private __isDisposed: boolean = false
  private __dispose: () => void

  constructor(dispose: () => void) {
    this.__dispose = dispose
  }

  public dispose(): void {
    if (!this.__isDisposed) {
      this.__isDisposed = true
      this.__dispose()
    }
  }
}
