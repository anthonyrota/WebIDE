import { IDisposable } from 'src/models/Disposable/IDisposable'
import { IESObservableSubscription } from 'src/models/Stream/ESObservable'

export class ESObservableSubscriptionDisposable implements IDisposable {
  private __esObservableSubscription: IESObservableSubscription

  constructor(__esObservableSubscription: IESObservableSubscription) {
    this.__esObservableSubscription = __esObservableSubscription
  }

  public dispose(): void {
    if (!this.__esObservableSubscription.closed) {
      this.__esObservableSubscription.unsubscribe()
    }
  }
}
