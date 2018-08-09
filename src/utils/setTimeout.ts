import { IDisposable } from 'src/models/Disposable/IDisposable'
import { root } from 'src/utils/root'

export function setTimeout(callback: () => void, delay: number): IDisposable {
  const timeoutId = root.setTimeout(callback, delay)

  return new SetTimeoutDisposable(timeoutId)
}

class SetTimeoutDisposable implements IDisposable {
  constructor(private timeoutId: any) {}

  public dispose(): void {
    clearTimeout(this.timeoutId)
  }
}
