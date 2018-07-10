import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { isDisposable } from 'src/models/Disposable/isDisposable'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscribable, ISubscriber } from 'src/models/Stream/ISubscriber'
import { Subscription } from 'src/models/Stream/Subscription'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { isFunction } from 'src/utils/isFunction'

export abstract class Stream<T> implements ISubscribable<T> {
  public lift<U>(operator: IOperator<T, U>): Stream<U> {
    return new LiftedStream<T, U>(this, operator)
  }

  public subscribe(targetSubscriber: ISubscriber<T>): Subscription {
    const transmitter = new MonoTypeValueTransmitter(targetSubscriber)
    const target = new SubscriptionTarget(transmitter)
    const subscription = new Subscription(transmitter)

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
    target: SubscriptionTarget<T>
  ): IDisposableLike
}

export class RawStream<T> extends Stream<T> {
  private __subscribe: (target: SubscriptionTarget<T>) => void

  constructor(subscribe: (target: SubscriptionTarget<T>) => void) {
    super()
    this.__subscribe = subscribe
  }

  protected trySubscribe(target: SubscriptionTarget<T>): IDisposableLike {
    return this.__subscribe(target)
  }
}

class LiftedStream<T, U> extends Stream<U> {
  private __source: Stream<T>
  private __operator: IOperator<T, U>

  constructor(source: Stream<T>, operator: IOperator<T, U>) {
    super()
    this.__source = source
    this.__operator = operator
  }

  protected trySubscribe(target: SubscriptionTarget<U>): IDisposableLike {
    return this.__operator.call(target, this.__source)
  }
}
