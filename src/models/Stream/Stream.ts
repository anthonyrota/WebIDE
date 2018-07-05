import { IDisposable } from 'src/models/Disposable/IDisposable'
import { toDisposable } from 'src/models/Disposable/toDisposable'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { StreamDistributor } from 'src/models/Stream/StreamDistributor'
import { StreamSubscription } from 'src/models/Stream/StreamSubscription'
import { StreamTarget } from 'src/models/Stream/StreamTarget'

export class Stream<T> {
  private __subscribe: (
    target: StreamTarget<T>
  ) => IDisposable | (() => void) | void

  constructor(
    subscribe: (target: StreamTarget<T>) => IDisposable | (() => void) | void
  ) {
    this.__subscribe = subscribe
  }

  public subscribe(subscriber: IStreamSubscriber<T>): StreamSubscription {
    const distributor = new StreamDistributor(subscriber)
    const target = new StreamTarget(distributor)
    const subscription = new StreamSubscription(distributor)
    const disposableMaybe = toDisposable(this.__trySubscribe(target))

    disposableMaybe.withValue(disposable => {
      distributor.terminateDisposableWhenDisposed(disposable)
    })

    return subscription
  }

  private __trySubscribe(
    target: StreamTarget<T>
  ): IDisposable | (() => void) | void {
    try {
      return this.__subscribe(target)
    } catch (error) {
      target.error(error)
    }
  }
}
