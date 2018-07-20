import { IDisposable } from 'src/models/Disposable/IDisposable'
import { ISubscription, Subscription } from 'src/models/Disposable/Subscription'
import { root } from 'src/utils/root'

export function setInterval(
  callback: () => void,
  delay: number
): ISubscription {
  const timeoutId = root.setInterval(callback, delay)

  return Subscription.fromDisposable(new SetIntervalDisposable(timeoutId))
}

class SetIntervalDisposable implements IDisposable {
  constructor(private intervalId: any) {}

  public dispose(): void {
    clearInterval(this.intervalId)
  }
}
