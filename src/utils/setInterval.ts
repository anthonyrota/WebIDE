import { IDisposable } from 'src/models/Disposable/IDisposable'
import { root } from 'src/utils/root'

export function setInterval(callback: () => void, delay: number): IDisposable {
  const timeoutId = root.setInterval(callback, delay)

  return new SetIntervalDisposable(timeoutId)
}

class SetIntervalDisposable implements IDisposable {
  constructor(private intervalId: any) {}

  public dispose(): void {
    clearInterval(this.intervalId)
  }
}
