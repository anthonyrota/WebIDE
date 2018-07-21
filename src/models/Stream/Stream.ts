import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { isDisposable } from 'src/models/Disposable/isDisposable'
import { ISubscription } from 'src/models/Disposable/Subscription'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscribable, ISubscriber } from 'src/models/Stream/ISubscriber'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { isFunction } from 'src/utils/isFunction'

export function isStream(value: any): value is Stream<any> {
  return value instanceof Stream
}

export abstract class Stream<T> implements ISubscribable<T> {
  public lift<U>(operator: IOperator<T, U>): Stream<U> {
    return new LiftedStream<T, U>(this, operator)
  }

  public subscribe(targetSubscriber: ISubscriber<T>): ISubscription {
    const target = new MonoTypeValueTransmitter(targetSubscriber)

    let disposable: IDisposableLike

    try {
      disposable = this.trySubscribe(target)
    } catch (error) {
      target.error(error)
    }

    if (disposable) {
      if (isDisposable(disposable)) {
        target.terminateDisposableWhenDisposed(disposable)
      } else if (isFunction(disposable)) {
        target.onDispose(disposable)
      }
    }

    return target
  }

  protected abstract trySubscribe(
    target: MonoTypeValueTransmitter<T>
  ): IDisposableLike
}

export class RawStream<T> extends Stream<T> {
  private __subscribe: (target: MonoTypeValueTransmitter<T>) => void

  constructor(subscribe: (target: MonoTypeValueTransmitter<T>) => void) {
    super()
    this.__subscribe = subscribe
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    return this.__subscribe(target)
  }
}

export class DuplicateStream<T> extends Stream<T> {
  private __source: ISubscribable<T>

  constructor(source: ISubscribable<T>) {
    super()
    this.__source = source
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    return this.__source.subscribe(target)
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

  protected trySubscribe(target: MonoTypeValueTransmitter<U>): IDisposableLike {
    return this.__operator.call(target, this.__source)
  }
}
