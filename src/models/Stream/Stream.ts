import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { isDisposable } from 'src/models/Disposable/isDisposable'
import { ISubscription } from 'src/models/Disposable/Subscription'
import {
  IConnectOperator,
  isConnectOperator,
  ITransformOperator
} from 'src/models/Stream/IOperator'
import { ISubscribable, ISubscriber } from 'src/models/Stream/ISubscriber'
import {
  isValueTransmitter,
  MonoTypeValueTransmitter
} from 'src/models/Stream/ValueTransmitter'
import { isFunction } from 'src/utils/isFunction'

export function isStream(value: any): value is Stream<any> {
  return value instanceof Stream
}

export abstract class Stream<T> implements ISubscribable<T> {
  public lift<U>(connectOperator: IConnectOperator<T, U>): Stream<U>
  public lift<U, TStreamOutput extends Stream<U>>(
    transformOperator: ITransformOperator<T, U, TStreamOutput>
  ): TStreamOutput
  public lift<U, TStreamOutput extends Stream<U>>(
    transformOrConnectOperator:
      | IConnectOperator<T, U>
      | ITransformOperator<T, U, TStreamOutput>
  ): Stream<U> | TStreamOutput {
    return isConnectOperator(transformOrConnectOperator)
      ? new LiftedStream<T, U>(this, transformOrConnectOperator)
      : transformOrConnectOperator.transform(this)
  }

  public subscribe(
    targetSubscriber: ISubscriber<T> | MonoTypeValueTransmitter<T>
  ): ISubscription {
    const target = isValueTransmitter(targetSubscriber)
      ? targetSubscriber
      : new MonoTypeValueTransmitter(targetSubscriber)

    let disposable: IDisposableLike

    try {
      disposable = this.trySubscribe(target)
    } catch (error) {
      target.error(error)
    }

    if (disposable) {
      if (isDisposable(disposable)) {
        target.terminateDisposableWhenStopsReceivingValues(disposable)
      } else if (isFunction(disposable)) {
        target.onStopReceivingValues(disposable)
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
  private __operator: IConnectOperator<T, U>

  constructor(source: Stream<T>, operator: IConnectOperator<T, U>) {
    super()
    this.__source = source
    this.__operator = operator
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<U>): IDisposableLike {
    return this.__operator.connect(
      target,
      this.__source
    )
  }
}
