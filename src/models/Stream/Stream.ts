import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { isDisposable } from 'src/models/Disposable/isDisposable'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { StreamSubscription } from 'src/models/Stream/StreamSubscription'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { MonoTypeStreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
import { isFunction } from 'src/utils/isFunction'

export abstract class Stream<T> {
  public lift<U>(operator: IOperator<T, U>): Stream<U> {
    return new LiftedStream<T, U>(this, operator)
  }

  public subscribe(targetSubscriber: IStreamSubscriber<T>): StreamSubscription {
    const transmitter = new MonoTypeStreamValueTransmitter(targetSubscriber)
    const target = new StreamSubscriptionTarget(transmitter)
    const subscription = new StreamSubscription(transmitter)

    let disposable: IDisposableLike

    try {
      disposable = this.trySubscribe(target)
    } catch (error) {
      target.error(error)
    }

    if (isDisposable(disposable)) {
      transmitter.terminateDisposableWhenDisposed(disposable)
    } else if (isFunction(disposable)) {
      transmitter.onDispose(disposable)
    }

    return subscription
  }

  protected abstract trySubscribe(
    target: StreamSubscriptionTarget<T>
  ): IDisposableLike
}

export class RawStream<T> extends Stream<T> {
  private __subscribe: (target: StreamSubscriptionTarget<T>) => void

  constructor(subscribe: (target: StreamSubscriptionTarget<T>) => void) {
    super()
    this.__subscribe = subscribe
  }

  protected trySubscribe(target: StreamSubscriptionTarget<T>): IDisposableLike {
    return this.__subscribe(target)
  }
}

export class LiftedStream<T, U> extends Stream<U> {
  private __source: Stream<T>
  private __operator: IOperator<T, U>

  constructor(source: Stream<T>, operator: IOperator<T, U>) {
    super()
    this.__source = source
    this.__operator = operator
  }

  protected trySubscribe(target: StreamSubscriptionTarget<U>): IDisposableLike {
    return this.__operator.call(target, this.__source)
  }
}
