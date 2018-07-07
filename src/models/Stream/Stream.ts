import { IDisposableLike } from 'src/models/Disposable/IDisposableLIke'
import { toDisposable } from 'src/models/Disposable/toDisposable'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { MonoTypeStreamDistributor } from 'src/models/Stream/StreamDistributor'
import { StreamSubscription } from 'src/models/Stream/StreamSubscription'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'

export class Stream<T> {
  private __subscribe?: (target: StreamSubscriptionTarget<T>) => IDisposableLike

  constructor(
    subscribe?: (target: StreamSubscriptionTarget<T>) => IDisposableLike
  ) {
    this.__subscribe = subscribe
  }

  public lift<U>(operator: IOperator<T, U>): Stream<U> {
    return new LiftedStream<T, U>(this, operator)
  }

  public subscribe(targetSubscriber: IStreamSubscriber<T>): StreamSubscription {
    const distributor = new MonoTypeStreamDistributor(targetSubscriber)
    const target = new StreamSubscriptionTarget(distributor)
    const subscription = new StreamSubscription(distributor)
    const disposableMaybe = toDisposable(this.trySubscribe(target))

    disposableMaybe.withValue(disposable => {
      distributor.terminateDisposableWhenDisposed(disposable)
    })

    return subscription
  }

  protected trySubscribe(target: StreamSubscriptionTarget<T>): IDisposableLike {
    if (this.__subscribe) {
      try {
        return this.__subscribe(target)
      } catch (error) {
        target.error(error)
      }
    }
  }
}

class LiftedStream<IInput, IOutput> extends Stream<IOutput> {
  private __source: Stream<IInput>
  private __operator: IOperator<IInput, IOutput>

  constructor(source: Stream<IInput>, operator: IOperator<IInput, IOutput>) {
    super()
    this.__source = source
    this.__operator = operator
  }

  protected trySubscribe(
    target: StreamSubscriptionTarget<IOutput>
  ): IDisposableLike {
    try {
      return this.__operator.call(target, this.__source)
    } catch (error) {
      target.error(error)
    }
  }
}
