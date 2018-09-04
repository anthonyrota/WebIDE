import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import {
  isSubscriptionPropertyKey,
  ISubscription,
  Subscription
} from 'src/models/Disposable/Subscription'
import {
  ImmutableMutableMaybeView,
  MutableMaybe
} from 'src/models/Maybe/MutableMaybe'
import { IOperator } from 'src/models/Stream/IOperator'
import {
  IReceivingValuesSubscription,
  isReceivingValuesSubscriptionPropertyKey
} from 'src/models/Stream/IReceivingValuesSubscription'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'
import { DuplicateStream, Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { removeOnce } from 'src/utils/removeOnce'

export interface IDistributedStream<TInput, TOutput>
  extends Stream<TOutput>,
    ISubscription,
    IReceivingValuesSubscription,
    IRequiredSubscriber<TInput> {
  lift<U>(operator: IOperator<TOutput, U>): IDistributedStream<TInput, U>
  liftAll(): IDistributedStream<TInput, TOutput>
  liftAll<A>(
    op1: IOperator<TOutput, A, IDistributedStream<TInput, TOutput>>
  ): IDistributedStream<TInput, A>
  liftAll<A, B>(
    op1: IOperator<TOutput, A, IDistributedStream<TInput, TOutput>>,
    op2: IOperator<A, B, IDistributedStream<TInput, A>>
  ): IDistributedStream<TInput, B>
  liftAll<A, B, C>(
    op1: IOperator<TOutput, A, IDistributedStream<TInput, TOutput>>,
    op2: IOperator<A, B, IDistributedStream<TInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TInput, B>>
  ): IDistributedStream<TInput, C>
  liftAll<A, B, C, D>(
    op1: IOperator<TOutput, A, IDistributedStream<TInput, TOutput>>,
    op2: IOperator<A, B, IDistributedStream<TInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TInput, C>>
  ): IDistributedStream<TInput, D>
  liftAll<A, B, C, D, E>(
    op1: IOperator<TOutput, A, IDistributedStream<TInput, TOutput>>,
    op2: IOperator<A, B, IDistributedStream<TInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TInput, D>>
  ): IDistributedStream<TInput, E>
  liftAll<A, B, C, D, E, F>(
    op1: IOperator<TOutput, A, IDistributedStream<TInput, TOutput>>,
    op2: IOperator<A, B, IDistributedStream<TInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TInput, D>>,
    op6: IOperator<E, F, IDistributedStream<TInput, E>>
  ): IDistributedStream<TInput, F>
  liftAll<A, B, C, D, E, F, G>(
    op1: IOperator<TOutput, A, IDistributedStream<TInput, TOutput>>,
    op2: IOperator<A, B, IDistributedStream<TInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TInput, D>>,
    op6: IOperator<E, F, IDistributedStream<TInput, E>>,
    op7: IOperator<F, G, IDistributedStream<TInput, F>>
  ): IDistributedStream<TInput, G>
  liftAll<A, B, C, D, E, F, G, H>(
    op1: IOperator<TOutput, A, IDistributedStream<TInput, TOutput>>,
    op2: IOperator<A, B, IDistributedStream<TInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TInput, D>>,
    op6: IOperator<E, F, IDistributedStream<TInput, E>>,
    op7: IOperator<F, G, IDistributedStream<TInput, F>>,
    op8: IOperator<G, H, IDistributedStream<TInput, G>>
  ): IDistributedStream<TInput, H>
  liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<TOutput, A, IDistributedStream<TInput, TOutput>>,
    op2: IOperator<A, B, IDistributedStream<TInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TInput, D>>,
    op6: IOperator<E, F, IDistributedStream<TInput, E>>,
    op7: IOperator<F, G, IDistributedStream<TInput, F>>,
    op8: IOperator<G, H, IDistributedStream<TInput, G>>,
    op9: IOperator<H, I, IDistributedStream<TInput, H>>
  ): IDistributedStream<TInput, I>
  liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<TOutput, A, IDistributedStream<TInput, TOutput>>,
    op2: IOperator<A, B, IDistributedStream<TInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TInput, D>>,
    op6: IOperator<E, F, IDistributedStream<TInput, E>>,
    op7: IOperator<F, G, IDistributedStream<TInput, F>>,
    op8: IOperator<G, H, IDistributedStream<TInput, G>>,
    op9: IOperator<H, I, IDistributedStream<TInput, H>>,
    ...operators: Array<IOperator<any, any, IDistributedStream<any, any>>>
  ): IDistributedStream<TInput, any>
  isReceivingValues(): boolean
  asStream(): Stream<TOutput>
}

export class DistributedStream<T> extends Stream<T>
  implements IDistributedStream<T, T> {
  public readonly [isSubscriptionPropertyKey] = true;
  public readonly [isReceivingValuesSubscriptionPropertyKey] = true

  private __mutableThrownError: MutableMaybe<unknown> = MutableMaybe.none<
    unknown
  >()
  private __targets: Array<IRequiredSubscriber<T>> = []
  private __isReceivingValues: boolean = true
  private __selfSubscription: ISubscription = new Subscription()
  private __onStopReceivingValuesSubscription: ISubscription = new Subscription()

  public terminateDisposableWhenDisposed(
    disposable: IDisposable
  ): ISubscription {
    return this.__selfSubscription.terminateDisposableWhenDisposed(disposable)
  }

  public terminateDisposableLikeWhenDisposed(
    disposableLike: DisposableLike
  ): ISubscription {
    return this.__selfSubscription.terminateDisposableLikeWhenDisposed(
      disposableLike
    )
  }

  public onDispose(dispose: () => void): ISubscription {
    return this.__selfSubscription.onDispose(dispose)
  }

  public removeSubscription(subscription: ISubscription): void {
    this.__selfSubscription.removeSubscription(subscription)
  }

  public terminateDisposableWhenStopsReceivingValues(
    disposable: IDisposable
  ): ISubscription {
    return this.__onStopReceivingValuesSubscription.terminateDisposableWhenDisposed(
      disposable
    )
  }

  public terminateDisposableLikeWhenStopsReceivingValues(
    disposableLike: IDisposable
  ): ISubscription {
    return this.__onStopReceivingValuesSubscription.terminateDisposableLikeWhenDisposed(
      disposableLike
    )
  }

  public onStopReceivingValues(dispose: () => void): ISubscription {
    return this.__onStopReceivingValuesSubscription.onDispose(dispose)
  }

  public removeOnStopReceivingValuesSubscription(
    subscription: ISubscription
  ): void {
    this.__onStopReceivingValuesSubscription.removeSubscription(subscription)
  }

  public lift<U>(operator: IOperator<T, U>): IDistributedStream<T, U> {
    return new LiftedDistributedStream<T, T, U>(this, operator)
  }

  public liftAll(): IDistributedStream<T, T>
  public liftAll<A>(
    op1: IOperator<T, A, IDistributedStream<T, T>>
  ): IDistributedStream<T, A>
  public liftAll<A, B>(
    op1: IOperator<T, A, IDistributedStream<T, T>>,
    op2: IOperator<A, B, IDistributedStream<T, A>>
  ): IDistributedStream<T, B>
  public liftAll<A, B, C>(
    op1: IOperator<T, A, IDistributedStream<T, T>>,
    op2: IOperator<A, B, IDistributedStream<T, A>>,
    op3: IOperator<B, C, IDistributedStream<T, B>>
  ): IDistributedStream<T, C>
  public liftAll<A, B, C, D>(
    op1: IOperator<T, A, IDistributedStream<T, T>>,
    op2: IOperator<A, B, IDistributedStream<T, A>>,
    op3: IOperator<B, C, IDistributedStream<T, B>>,
    op4: IOperator<C, D, IDistributedStream<T, C>>
  ): IDistributedStream<T, D>
  public liftAll<A, B, C, D, E>(
    op1: IOperator<T, A, IDistributedStream<T, T>>,
    op2: IOperator<A, B, IDistributedStream<T, A>>,
    op3: IOperator<B, C, IDistributedStream<T, B>>,
    op4: IOperator<C, D, IDistributedStream<T, C>>,
    op5: IOperator<D, E, IDistributedStream<T, D>>
  ): IDistributedStream<T, E>
  public liftAll<A, B, C, D, E, F>(
    op1: IOperator<T, A, IDistributedStream<T, T>>,
    op2: IOperator<A, B, IDistributedStream<T, A>>,
    op3: IOperator<B, C, IDistributedStream<T, B>>,
    op4: IOperator<C, D, IDistributedStream<T, C>>,
    op5: IOperator<D, E, IDistributedStream<T, D>>,
    op6: IOperator<E, F, IDistributedStream<T, E>>
  ): IDistributedStream<T, F>
  public liftAll<A, B, C, D, E, F, G>(
    op1: IOperator<T, A, IDistributedStream<T, T>>,
    op2: IOperator<A, B, IDistributedStream<T, A>>,
    op3: IOperator<B, C, IDistributedStream<T, B>>,
    op4: IOperator<C, D, IDistributedStream<T, C>>,
    op5: IOperator<D, E, IDistributedStream<T, D>>,
    op6: IOperator<E, F, IDistributedStream<T, E>>,
    op7: IOperator<F, G, IDistributedStream<T, F>>
  ): IDistributedStream<T, G>
  public liftAll<A, B, C, D, E, F, G, H>(
    op1: IOperator<T, A, IDistributedStream<T, T>>,
    op2: IOperator<A, B, IDistributedStream<T, A>>,
    op3: IOperator<B, C, IDistributedStream<T, B>>,
    op4: IOperator<C, D, IDistributedStream<T, C>>,
    op5: IOperator<D, E, IDistributedStream<T, D>>,
    op6: IOperator<E, F, IDistributedStream<T, E>>,
    op7: IOperator<F, G, IDistributedStream<T, F>>,
    op8: IOperator<G, H, IDistributedStream<T, G>>
  ): IDistributedStream<T, H>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<T, A, IDistributedStream<T, T>>,
    op2: IOperator<A, B, IDistributedStream<T, A>>,
    op3: IOperator<B, C, IDistributedStream<T, B>>,
    op4: IOperator<C, D, IDistributedStream<T, C>>,
    op5: IOperator<D, E, IDistributedStream<T, D>>,
    op6: IOperator<E, F, IDistributedStream<T, E>>,
    op7: IOperator<F, G, IDistributedStream<T, F>>,
    op8: IOperator<G, H, IDistributedStream<T, G>>,
    op9: IOperator<H, I, IDistributedStream<T, H>>
  ): IDistributedStream<T, I>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<T, A, IDistributedStream<T, T>>,
    op2: IOperator<A, B, IDistributedStream<T, A>>,
    op3: IOperator<B, C, IDistributedStream<T, B>>,
    op4: IOperator<C, D, IDistributedStream<T, C>>,
    op5: IOperator<D, E, IDistributedStream<T, D>>,
    op6: IOperator<E, F, IDistributedStream<T, E>>,
    op7: IOperator<F, G, IDistributedStream<T, F>>,
    op8: IOperator<G, H, IDistributedStream<T, G>>,
    op9: IOperator<H, I, IDistributedStream<T, H>>,
    ...operators: Array<IOperator<any, any, IDistributedStream<any, any>>>
  ): IDistributedStream<T, any>
  public liftAll(
    ...operators: Array<IOperator<any, any>>
  ): IDistributedStream<T, any> {
    let resultStream: IDistributedStream<T, any> = this

    for (let i = 0; i < operators.length; i++) {
      resultStream = resultStream.lift(operators[i])
    }

    return resultStream
  }

  public next(value: T): void {
    if (this.__selfSubscription.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    if (this.__isReceivingValues) {
      const subscribers = this.__targets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].next(value)
      }
    }
  }

  public error(error: unknown): void {
    if (this.__selfSubscription.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    if (this.__isReceivingValues) {
      this.__mutableThrownError.setValue(error)
      this.__isReceivingValues = false
      this.__onStopReceivingValuesSubscription.dispose()

      const subscribers = this.__targets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].error(error)
      }

      this.__targets.length = 0
    }
  }

  public complete(): void {
    if (this.__selfSubscription.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    if (this.__isReceivingValues) {
      this.__isReceivingValues = false
      this.__onStopReceivingValuesSubscription.dispose()

      const subscribers = this.__targets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].complete()
      }

      this.__targets.length = 0
    }
  }

  public dispose(): void {
    if (this.__selfSubscription.isActive()) {
      this.__isReceivingValues = false
      this.__targets.length = 0
      this.__onStopReceivingValuesSubscription.dispose()
      this.__selfSubscription.dispose()
    }
  }

  public isActive(): boolean {
    return this.__selfSubscription.isActive()
  }

  public isDisposed(): boolean {
    return this.__selfSubscription.isDisposed()
  }

  public isReceivingValues(): boolean {
    return this.__isReceivingValues
  }

  public asStream(): Stream<T> {
    return new DuplicateStream<T>(this)
  }

  protected getThrownError(): ImmutableMutableMaybeView<unknown> {
    return this.__mutableThrownError.getImmutableView()
  }

  protected throwError(): void {
    this.__mutableThrownError.throwValue()
  }

  protected trySubscribe(target: ValueTransmitter<T, unknown>): DisposableLike {
    if (this.__selfSubscription.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    this.__mutableThrownError.throwValue()

    if (this.__isReceivingValues) {
      target.complete()
    } else {
      return this.pushTarget(target)
    }
  }

  protected pushTarget(target: IRequiredSubscriber<T>): IDisposable {
    this.__targets.push(target)

    return new RawDistributedStreamSubscriptionDisposable(
      this,
      this.__targets,
      target
    )
  }
}

class LiftedDistributedStream<TStreamInput, TOperatorInput, TOperatorOutput>
  extends Stream<TOperatorOutput>
  implements IDistributedStream<TStreamInput, TOperatorOutput> {
  public readonly [isSubscriptionPropertyKey] = true;
  public readonly [isReceivingValuesSubscriptionPropertyKey] = true

  private __source: IDistributedStream<TStreamInput, TOperatorInput>
  private __operator: IOperator<TOperatorInput, TOperatorOutput>
  private __selfSubscription: ISubscription = new Subscription()

  constructor(
    source: IDistributedStream<TStreamInput, TOperatorInput>,
    operator: IOperator<TOperatorInput, TOperatorOutput>
  ) {
    super()
    this.__source = source
    this.__operator = operator
  }

  public terminateDisposableWhenDisposed(
    disposable: IDisposable
  ): ISubscription {
    return this.__selfSubscription.terminateDisposableWhenDisposed(disposable)
  }

  public terminateDisposableLikeWhenDisposed(
    disposableLike: DisposableLike
  ): ISubscription {
    return this.__selfSubscription.terminateDisposableLikeWhenDisposed(
      disposableLike
    )
  }

  public onDispose(dispose: () => void): ISubscription {
    return this.__selfSubscription.onDispose(dispose)
  }

  public removeSubscription(subscription: ISubscription): void {
    this.__selfSubscription.removeSubscription(subscription)
  }

  public terminateDisposableWhenStopsReceivingValues(
    disposable: IDisposable
  ): ISubscription {
    return this.__source.terminateDisposableWhenStopsReceivingValues(disposable)
  }

  public terminateDisposableLikeWhenStopsReceivingValues(
    disposableLike: IDisposable
  ): ISubscription {
    return this.__source.terminateDisposableLikeWhenStopsReceivingValues(
      disposableLike
    )
  }

  public onStopReceivingValues(dispose: () => void): ISubscription {
    return this.__source.onStopReceivingValues(dispose)
  }

  public removeOnStopReceivingValuesSubscription(
    subscription: ISubscription
  ): void {
    this.__source.removeOnStopReceivingValuesSubscription(subscription)
  }

  public lift<U>(
    operator: IOperator<TOperatorOutput, U>
  ): IDistributedStream<TStreamInput, U> {
    return new LiftedDistributedStream<TStreamInput, TOperatorOutput, U>(
      this,
      operator
    )
  }

  public liftAll(): IDistributedStream<TStreamInput, TOperatorOutput>
  public liftAll<A>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IDistributedStream<TStreamInput, TOperatorOutput>
    >
  ): IDistributedStream<TStreamInput, A>
  public liftAll<A, B>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IDistributedStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IDistributedStream<TStreamInput, A>>
  ): IDistributedStream<TStreamInput, B>
  public liftAll<A, B, C>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IDistributedStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IDistributedStream<TStreamInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TStreamInput, B>>
  ): IDistributedStream<TStreamInput, C>
  public liftAll<A, B, C, D>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IDistributedStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IDistributedStream<TStreamInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TStreamInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TStreamInput, C>>
  ): IDistributedStream<TStreamInput, D>
  public liftAll<A, B, C, D, E>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IDistributedStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IDistributedStream<TStreamInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TStreamInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TStreamInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TStreamInput, D>>
  ): IDistributedStream<TStreamInput, E>
  public liftAll<A, B, C, D, E, F>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IDistributedStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IDistributedStream<TStreamInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TStreamInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TStreamInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TStreamInput, D>>,
    op6: IOperator<E, F, IDistributedStream<TStreamInput, E>>
  ): IDistributedStream<TStreamInput, F>
  public liftAll<A, B, C, D, E, F, G>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IDistributedStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IDistributedStream<TStreamInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TStreamInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TStreamInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TStreamInput, D>>,
    op6: IOperator<E, F, IDistributedStream<TStreamInput, E>>,
    op7: IOperator<F, G, IDistributedStream<TStreamInput, F>>
  ): IDistributedStream<TStreamInput, G>
  public liftAll<A, B, C, D, E, F, G, H>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IDistributedStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IDistributedStream<TStreamInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TStreamInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TStreamInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TStreamInput, D>>,
    op6: IOperator<E, F, IDistributedStream<TStreamInput, E>>,
    op7: IOperator<F, G, IDistributedStream<TStreamInput, F>>,
    op8: IOperator<G, H, IDistributedStream<TStreamInput, G>>
  ): IDistributedStream<TStreamInput, H>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IDistributedStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IDistributedStream<TStreamInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TStreamInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TStreamInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TStreamInput, D>>,
    op6: IOperator<E, F, IDistributedStream<TStreamInput, E>>,
    op7: IOperator<F, G, IDistributedStream<TStreamInput, F>>,
    op8: IOperator<G, H, IDistributedStream<TStreamInput, G>>,
    op9: IOperator<H, I, IDistributedStream<TStreamInput, H>>
  ): IDistributedStream<TStreamInput, I>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IDistributedStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IDistributedStream<TStreamInput, A>>,
    op3: IOperator<B, C, IDistributedStream<TStreamInput, B>>,
    op4: IOperator<C, D, IDistributedStream<TStreamInput, C>>,
    op5: IOperator<D, E, IDistributedStream<TStreamInput, D>>,
    op6: IOperator<E, F, IDistributedStream<TStreamInput, E>>,
    op7: IOperator<F, G, IDistributedStream<TStreamInput, F>>,
    op8: IOperator<G, H, IDistributedStream<TStreamInput, G>>,
    op9: IOperator<H, I, IDistributedStream<TStreamInput, H>>,
    ...operators: Array<IOperator<any, any, IDistributedStream<any, any>>>
  ): IDistributedStream<TStreamInput, any>
  public liftAll(
    ...operators: Array<IOperator<any, any>>
  ): IDistributedStream<TStreamInput, any> {
    let resultStream: IDistributedStream<TStreamInput, any> = this

    for (let i = 0; i < operators.length; i++) {
      resultStream = resultStream.lift(operators[i])
    }

    return resultStream
  }

  public next(value: TStreamInput): void {
    if (this.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    this.__source.next(value)
  }

  public error(error: unknown): void {
    if (this.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    this.__source.error(error)
  }

  public complete(): void {
    if (this.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    this.__source.complete()
  }

  public dispose(): void {
    this.__selfSubscription.dispose()
  }

  public isActive(): boolean {
    return this.__selfSubscription.isActive() && this.__source.isActive()
  }

  public isDisposed(): boolean {
    return this.__selfSubscription.isDisposed() || this.__source.isDisposed()
  }

  public isReceivingValues(): boolean {
    return this.__source.isReceivingValues()
  }

  public asStream(): Stream<TOperatorOutput> {
    return new DuplicateStream(this)
  }

  protected trySubscribe(
    target: ValueTransmitter<TOperatorOutput, unknown>
  ): DisposableLike {
    if (this.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    return this.__operator.connect(
      target,
      this.__source
    )
  }
}

class RawDistributedStreamSubscriptionDisposable<T> implements IDisposable {
  constructor(
    private distributiveStream: DistributedStream<T>,
    private distributiveStreamTargets: Array<IRequiredSubscriber<T>>,
    private target: IRequiredSubscriber<T>
  ) {}

  public dispose() {
    if (this.distributiveStream.isReceivingValues()) {
      removeOnce(this.distributiveStreamTargets, this.target)
    }
  }
}
