import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { isDisposable } from 'src/models/Disposable/isDisposable'
import { ISubscription } from 'src/models/Disposable/Subscription'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscribable, ISubscriber } from 'src/models/Stream/ISubscriber'
import {
  isValueTransmitter,
  MonoTypeValueTransmitter,
  ValueTransmitter
} from 'src/models/Stream/ValueTransmitter'
import { isFunction } from 'src/utils/isFunction'

export function isStream(value: unknown): value is Stream<unknown> {
  return value instanceof Stream
}

export abstract class Stream<T> implements ISubscribable<T> {
  public lift<U>(operator: IOperator<T, U>): Stream<U> {
    return new LiftedStream<T, U>(this, operator)
  }

  public liftAll(): Stream<T>
  public liftAll<A>(op1: IOperator<T, A>): Stream<A>
  public liftAll<A, B>(op1: IOperator<T, A>, op2: IOperator<A, B>): Stream<B>
  public liftAll<A, B, C>(
    op1: IOperator<T, A>,
    op2: IOperator<A, B>,
    op3: IOperator<B, C>
  ): Stream<C>
  public liftAll<A, B, C, D>(
    op1: IOperator<T, A>,
    op2: IOperator<A, B>,
    op3: IOperator<B, C>,
    op4: IOperator<C, D>
  ): Stream<D>
  public liftAll<A, B, C, D, E>(
    op1: IOperator<T, A>,
    op2: IOperator<A, B>,
    op3: IOperator<B, C>,
    op4: IOperator<C, D>,
    op5: IOperator<D, E>
  ): Stream<E>
  public liftAll<A, B, C, D, E, F>(
    op1: IOperator<T, A>,
    op2: IOperator<A, B>,
    op3: IOperator<B, C>,
    op4: IOperator<C, D>,
    op5: IOperator<D, E>,
    op6: IOperator<E, F>
  ): Stream<F>
  public liftAll<A, B, C, D, E, F, G>(
    op1: IOperator<T, A>,
    op2: IOperator<A, B>,
    op3: IOperator<B, C>,
    op4: IOperator<C, D>,
    op5: IOperator<D, E>,
    op6: IOperator<E, F>,
    op7: IOperator<F, G>
  ): Stream<G>
  public liftAll<A, B, C, D, E, F, G, H>(
    op1: IOperator<T, A>,
    op2: IOperator<A, B>,
    op3: IOperator<B, C>,
    op4: IOperator<C, D>,
    op5: IOperator<D, E>,
    op6: IOperator<E, F>,
    op7: IOperator<F, G>,
    op8: IOperator<G, H>
  ): Stream<H>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<T, A>,
    op2: IOperator<A, B>,
    op3: IOperator<B, C>,
    op4: IOperator<C, D>,
    op5: IOperator<D, E>,
    op6: IOperator<E, F>,
    op7: IOperator<F, G>,
    op8: IOperator<G, H>,
    op9: IOperator<H, I>
  ): Stream<I>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<T, A>,
    op2: IOperator<A, B>,
    op3: IOperator<B, C>,
    op4: IOperator<C, D>,
    op5: IOperator<D, E>,
    op6: IOperator<E, F>,
    op7: IOperator<F, G>,
    op8: IOperator<G, H>,
    op9: IOperator<H, I>,
    ...operators: Array<IOperator<any, any>>
  ): Stream<any>
  public liftAll(...operators: Array<IOperator<any, any>>): Stream<any> {
    let resultStream: Stream<any> = this

    for (let i = 0; i < operators.length; i++) {
      resultStream = resultStream.lift(operators[i])
    }

    return resultStream
  }

  public subscribe(
    targetSubscriber: ISubscriber<T> | ValueTransmitter<T, unknown>
  ): ISubscription {
    const target = isValueTransmitter(targetSubscriber)
      ? targetSubscriber
      : new MonoTypeValueTransmitter<T>(targetSubscriber)

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
    target: ValueTransmitter<T, unknown> | MonoTypeValueTransmitter<T>
  ): IDisposableLike
}

export class RawStream<T> extends Stream<T> {
  private __subscribe: (target: ValueTransmitter<T, unknown>) => void

  constructor(subscribe: (target: ValueTransmitter<T, unknown>) => void) {
    super()
    this.__subscribe = subscribe
  }

  protected trySubscribe(
    target: ValueTransmitter<T, unknown>
  ): IDisposableLike {
    return this.__subscribe(target)
  }
}

export class DuplicateStream<T> extends Stream<T> {
  private __source: ISubscribable<T>

  constructor(source: ISubscribable<T>) {
    super()
    this.__source = source
  }

  protected trySubscribe(
    target: ValueTransmitter<T, unknown>
  ): IDisposableLike {
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

  protected trySubscribe(
    target: ValueTransmitter<U, unknown>
  ): IDisposableLike {
    return this.__operator.connect(
      target,
      this.__source
    )
  }
}
