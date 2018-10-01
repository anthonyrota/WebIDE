import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import {
  emptySubscription,
  ISubscription
} from 'src/models/Disposable/Subscription'
import { isReceivingValuesSubscription } from 'src/models/Stream/IReceivingValuesSubscription'
import { ISubscribable, ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { Operation } from 'src/models/Stream/Operation'
import {
  MonoTypeValueTransmitter,
  ValueTransmitter
} from 'src/models/Stream/ValueTransmitter'

export function isStream(value: unknown): value is Stream<unknown> {
  return value instanceof Stream
}

export abstract class Stream<T> implements ISubscribable<T> {
  public lift<U>(operation: Operation<T, U>): Stream<U> {
    return new LiftedStream<T, U>(this, operation)
  }

  public liftAll(): Stream<T>
  public liftAll<A>(op1: Operation<T, A>): Stream<A>
  public liftAll<A, B>(op1: Operation<T, A>, op2: Operation<A, B>): Stream<B>
  public liftAll<A, B, C>(
    op1: Operation<T, A>,
    op2: Operation<A, B>,
    op3: Operation<B, C>
  ): Stream<C>
  public liftAll<A, B, C, D>(
    op1: Operation<T, A>,
    op2: Operation<A, B>,
    op3: Operation<B, C>,
    op4: Operation<C, D>
  ): Stream<D>
  public liftAll<A, B, C, D, E>(
    op1: Operation<T, A>,
    op2: Operation<A, B>,
    op3: Operation<B, C>,
    op4: Operation<C, D>,
    op5: Operation<D, E>
  ): Stream<E>
  public liftAll<A, B, C, D, E, F>(
    op1: Operation<T, A>,
    op2: Operation<A, B>,
    op3: Operation<B, C>,
    op4: Operation<C, D>,
    op5: Operation<D, E>,
    op6: Operation<E, F>
  ): Stream<F>
  public liftAll<A, B, C, D, E, F, G>(
    op1: Operation<T, A>,
    op2: Operation<A, B>,
    op3: Operation<B, C>,
    op4: Operation<C, D>,
    op5: Operation<D, E>,
    op6: Operation<E, F>,
    op7: Operation<F, G>
  ): Stream<G>
  public liftAll<A, B, C, D, E, F, G, H>(
    op1: Operation<T, A>,
    op2: Operation<A, B>,
    op3: Operation<B, C>,
    op4: Operation<C, D>,
    op5: Operation<D, E>,
    op6: Operation<E, F>,
    op7: Operation<F, G>,
    op8: Operation<G, H>
  ): Stream<H>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: Operation<T, A>,
    op2: Operation<A, B>,
    op3: Operation<B, C>,
    op4: Operation<C, D>,
    op5: Operation<D, E>,
    op6: Operation<E, F>,
    op7: Operation<F, G>,
    op8: Operation<G, H>,
    op9: Operation<H, I>
  ): Stream<I>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: Operation<T, A>,
    op2: Operation<A, B>,
    op3: Operation<B, C>,
    op4: Operation<C, D>,
    op5: Operation<D, E>,
    op6: Operation<E, F>,
    op7: Operation<F, G>,
    op8: Operation<G, H>,
    op9: Operation<H, I>,
    ...operations: Array<Operation<any, any>>
  ): Stream<any>
  public liftAll(...operations: Array<Operation<any, any>>): Stream<any> {
    let resultStream: Stream<any> = this

    for (let i = 0; i < operations.length; i++) {
      resultStream = resultStream.lift(operations[i])
    }

    return resultStream
  }

  public subscribe(
    targetSubscriber: ISubscriptionTarget<T> | ValueTransmitter<T, unknown>
  ): ISubscription {
    if (
      isReceivingValuesSubscription(targetSubscriber) &&
      !targetSubscriber.isReceivingValues()
    ) {
      return emptySubscription
    }

    /**
     * This one is not used as if the target is a value transmitter, and
     * the target `disposeAndRecycle`s, then the producer will still be able
     * to send the destination values through the `next` method, etc., which
     * messes with operations such as `retryWhen` and `repeatWhen`. Because
     * of this, we always have to create a new intermediate value transmitter
     * which is then send to the `trySubscribe` function
     *
     * const target = isValueTransmitter(targetSubscriber)
     *   ? targetSubscriber
     *   : new MonoTypeValueTransmitter<T>(targetSubscriber)
     */

    const target = new MonoTypeValueTransmitter<T>(targetSubscriber)

    if (!target.isReceivingValues()) {
      return emptySubscription
    }

    let disposableLike: DisposableLike

    try {
      disposableLike = this.trySubscribe(target)
    } catch (error) {
      target.error(error)
    }

    target.addOnStopReceivingValues(disposableLike)

    return target
  }

  protected abstract trySubscribe(
    target: ValueTransmitter<T, unknown> | MonoTypeValueTransmitter<T>
  ): DisposableLike
}

export class RawStream<T> extends Stream<T> {
  private __subscribe: (target: ValueTransmitter<T, unknown>) => void

  constructor(subscribe: (target: ValueTransmitter<T, unknown>) => void) {
    super()
    this.__subscribe = subscribe
  }

  protected trySubscribe(target: ValueTransmitter<T, unknown>): DisposableLike {
    return this.__subscribe(target)
  }
}

export class DuplicateStream<T> extends Stream<T> {
  private __source: ISubscribable<T>

  constructor(source: ISubscribable<T>) {
    super()
    this.__source = source
  }

  protected trySubscribe(target: ValueTransmitter<T, unknown>): DisposableLike {
    return this.__source.subscribe(target)
  }
}

class LiftedStream<T, U> extends Stream<U> {
  private __source: Stream<T>
  private __operation: Operation<T, U>
  private __connectToTarget:
    | ((target: ValueTransmitter<U, unknown>) => DisposableLike)
    | null = null

  constructor(source: Stream<T>, operation: Operation<T, U>) {
    super()
    this.__source = source
    this.__operation = operation
  }

  protected trySubscribe(target: ValueTransmitter<U, unknown>): DisposableLike {
    if (!this.__connectToTarget) {
      this.__connectToTarget = this.__operation(this.__source)
    }

    return this.__connectToTarget(target)
  }
}
