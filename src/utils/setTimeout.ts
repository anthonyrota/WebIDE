import { IDisposable } from 'src/models/Disposable/IDisposable'
import { ISubscription, Subscription } from 'src/models/Disposable/Subscription'
import { root } from 'src/utils/root'

export function setTimeout(callback: () => void, delay: number): ISubscription {
  const timeoutId = root.setTimeout(callback, delay)

  return Subscription.fromDisposable(new SetTimeoutDisposable(timeoutId))
}

class SetTimeoutDisposable implements IDisposable {
  constructor(private timeoutId: any) {}

  public dispose(): void {
    clearTimeout(this.timeoutId)
  }
}
