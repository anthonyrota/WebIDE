import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import {
  IImmutableSubscriptionView,
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
  IReceivingValueSubscription,
  isReceivingValuesSubscriptionPropertyKey
} from 'src/models/Stream/IReceivingValuesSubscription'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'
import { DuplicateStream, Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { removeOnce } from 'src/utils/removeOnce'

export interface IControlledStream<TInput, TOutput>
  extends Stream<TOutput>,
    ISubscription,
    IReceivingValueSubscription,
    IRequiredSubscriber<TInput> {
  lift<U>(operator: IOperator<TOutput, U>): IControlledStream<TInput, U>
  liftAll(): IControlledStream<TInput, TOutput>
  liftAll<A>(
    op1: IOperator<TOutput, A, IControlledStream<TInput, TOutput>>
  ): IControlledStream<TInput, A>
  liftAll<A, B>(
    op1: IOperator<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: IOperator<A, B, IControlledStream<TInput, A>>
  ): IControlledStream<TInput, B>
  liftAll<A, B, C>(
    op1: IOperator<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: IOperator<A, B, IControlledStream<TInput, A>>,
    op3: IOperator<B, C, IControlledStream<TInput, B>>
  ): IControlledStream<TInput, C>
  liftAll<A, B, C, D>(
    op1: IOperator<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: IOperator<A, B, IControlledStream<TInput, A>>,
    op3: IOperator<B, C, IControlledStream<TInput, B>>,
    op4: IOperator<C, D, IControlledStream<TInput, C>>
  ): IControlledStream<TInput, D>
  liftAll<A, B, C, D, E>(
    op1: IOperator<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: IOperator<A, B, IControlledStream<TInput, A>>,
    op3: IOperator<B, C, IControlledStream<TInput, B>>,
    op4: IOperator<C, D, IControlledStream<TInput, C>>,
    op5: IOperator<D, E, IControlledStream<TInput, D>>
  ): IControlledStream<TInput, E>
  liftAll<A, B, C, D, E, F>(
    op1: IOperator<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: IOperator<A, B, IControlledStream<TInput, A>>,
    op3: IOperator<B, C, IControlledStream<TInput, B>>,
    op4: IOperator<C, D, IControlledStream<TInput, C>>,
    op5: IOperator<D, E, IControlledStream<TInput, D>>,
    op6: IOperator<E, F, IControlledStream<TInput, E>>
  ): IControlledStream<TInput, F>
  liftAll<A, B, C, D, E, F, G>(
    op1: IOperator<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: IOperator<A, B, IControlledStream<TInput, A>>,
    op3: IOperator<B, C, IControlledStream<TInput, B>>,
    op4: IOperator<C, D, IControlledStream<TInput, C>>,
    op5: IOperator<D, E, IControlledStream<TInput, D>>,
    op6: IOperator<E, F, IControlledStream<TInput, E>>,
    op7: IOperator<F, G, IControlledStream<TInput, F>>
  ): IControlledStream<TInput, G>
  liftAll<A, B, C, D, E, F, G, H>(
    op1: IOperator<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: IOperator<A, B, IControlledStream<TInput, A>>,
    op3: IOperator<B, C, IControlledStream<TInput, B>>,
    op4: IOperator<C, D, IControlledStream<TInput, C>>,
    op5: IOperator<D, E, IControlledStream<TInput, D>>,
    op6: IOperator<E, F, IControlledStream<TInput, E>>,
    op7: IOperator<F, G, IControlledStream<TInput, F>>,
    op8: IOperator<G, H, IControlledStream<TInput, G>>
  ): IControlledStream<TInput, H>
  liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: IOperator<A, B, IControlledStream<TInput, A>>,
    op3: IOperator<B, C, IControlledStream<TInput, B>>,
    op4: IOperator<C, D, IControlledStream<TInput, C>>,
    op5: IOperator<D, E, IControlledStream<TInput, D>>,
    op6: IOperator<E, F, IControlledStream<TInput, E>>,
    op7: IOperator<F, G, IControlledStream<TInput, F>>,
    op8: IOperator<G, H, IControlledStream<TInput, G>>,
    op9: IOperator<H, I, IControlledStream<TInput, H>>
  ): IControlledStream<TInput, I>
  liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: IOperator<A, B, IControlledStream<TInput, A>>,
    op3: IOperator<B, C, IControlledStream<TInput, B>>,
    op4: IOperator<C, D, IControlledStream<TInput, C>>,
    op5: IOperator<D, E, IControlledStream<TInput, D>>,
    op6: IOperator<E, F, IControlledStream<TInput, E>>,
    op7: IOperator<F, G, IControlledStream<TInput, F>>,
    op8: IOperator<G, H, IControlledStream<TInput, G>>,
    op9: IOperator<H, I, IControlledStream<TInput, H>>,
    ...operators: Array<IOperator<any, any, IControlledStream<any, any>>>
  ): IControlledStream<TInput, any>
  asStream(): Stream<TOutput>
}

export class ControlledStream<T> extends Stream<T>
  implements IControlledStream<T, T> {
  public readonly [isSubscriptionPropertyKey] = true;
  public readonly [isReceivingValuesSubscriptionPropertyKey] = true

  private __mutableThrownError: MutableMaybe<unknown> = MutableMaybe.none<
    unknown
  >()
  private __targets: Array<IRequiredSubscriber<T>> = []
  private __selfSubscription: ISubscription = new Subscription()
  private __onStopReceivingValuesSubscription: ISubscription = new Subscription()

  public add(disposableLike: DisposableLike): void {
    this.__selfSubscription.add(disposableLike)
  }

  public remove(disposableLike: DisposableLike): void {
    this.__selfSubscription.remove(disposableLike)
  }

  public getOnStopReceivingValuesSubscription(): IImmutableSubscriptionView {
    return this.__onStopReceivingValuesSubscription
  }

  public isReceivingValues(): boolean {
    return this.__onStopReceivingValuesSubscription.isActive()
  }

  public lift<U>(operator: IOperator<T, U>): IControlledStream<T, U> {
    return new LiftedControlledStream<T, T, U>(this, operator)
  }

  public liftAll(): IControlledStream<T, T>
  public liftAll<A>(
    op1: IOperator<T, A, IControlledStream<T, T>>
  ): IControlledStream<T, A>
  public liftAll<A, B>(
    op1: IOperator<T, A, IControlledStream<T, T>>,
    op2: IOperator<A, B, IControlledStream<T, A>>
  ): IControlledStream<T, B>
  public liftAll<A, B, C>(
    op1: IOperator<T, A, IControlledStream<T, T>>,
    op2: IOperator<A, B, IControlledStream<T, A>>,
    op3: IOperator<B, C, IControlledStream<T, B>>
  ): IControlledStream<T, C>
  public liftAll<A, B, C, D>(
    op1: IOperator<T, A, IControlledStream<T, T>>,
    op2: IOperator<A, B, IControlledStream<T, A>>,
    op3: IOperator<B, C, IControlledStream<T, B>>,
    op4: IOperator<C, D, IControlledStream<T, C>>
  ): IControlledStream<T, D>
  public liftAll<A, B, C, D, E>(
    op1: IOperator<T, A, IControlledStream<T, T>>,
    op2: IOperator<A, B, IControlledStream<T, A>>,
    op3: IOperator<B, C, IControlledStream<T, B>>,
    op4: IOperator<C, D, IControlledStream<T, C>>,
    op5: IOperator<D, E, IControlledStream<T, D>>
  ): IControlledStream<T, E>
  public liftAll<A, B, C, D, E, F>(
    op1: IOperator<T, A, IControlledStream<T, T>>,
    op2: IOperator<A, B, IControlledStream<T, A>>,
    op3: IOperator<B, C, IControlledStream<T, B>>,
    op4: IOperator<C, D, IControlledStream<T, C>>,
    op5: IOperator<D, E, IControlledStream<T, D>>,
    op6: IOperator<E, F, IControlledStream<T, E>>
  ): IControlledStream<T, F>
  public liftAll<A, B, C, D, E, F, G>(
    op1: IOperator<T, A, IControlledStream<T, T>>,
    op2: IOperator<A, B, IControlledStream<T, A>>,
    op3: IOperator<B, C, IControlledStream<T, B>>,
    op4: IOperator<C, D, IControlledStream<T, C>>,
    op5: IOperator<D, E, IControlledStream<T, D>>,
    op6: IOperator<E, F, IControlledStream<T, E>>,
    op7: IOperator<F, G, IControlledStream<T, F>>
  ): IControlledStream<T, G>
  public liftAll<A, B, C, D, E, F, G, H>(
    op1: IOperator<T, A, IControlledStream<T, T>>,
    op2: IOperator<A, B, IControlledStream<T, A>>,
    op3: IOperator<B, C, IControlledStream<T, B>>,
    op4: IOperator<C, D, IControlledStream<T, C>>,
    op5: IOperator<D, E, IControlledStream<T, D>>,
    op6: IOperator<E, F, IControlledStream<T, E>>,
    op7: IOperator<F, G, IControlledStream<T, F>>,
    op8: IOperator<G, H, IControlledStream<T, G>>
  ): IControlledStream<T, H>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<T, A, IControlledStream<T, T>>,
    op2: IOperator<A, B, IControlledStream<T, A>>,
    op3: IOperator<B, C, IControlledStream<T, B>>,
    op4: IOperator<C, D, IControlledStream<T, C>>,
    op5: IOperator<D, E, IControlledStream<T, D>>,
    op6: IOperator<E, F, IControlledStream<T, E>>,
    op7: IOperator<F, G, IControlledStream<T, F>>,
    op8: IOperator<G, H, IControlledStream<T, G>>,
    op9: IOperator<H, I, IControlledStream<T, H>>
  ): IControlledStream<T, I>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<T, A, IControlledStream<T, T>>,
    op2: IOperator<A, B, IControlledStream<T, A>>,
    op3: IOperator<B, C, IControlledStream<T, B>>,
    op4: IOperator<C, D, IControlledStream<T, C>>,
    op5: IOperator<D, E, IControlledStream<T, D>>,
    op6: IOperator<E, F, IControlledStream<T, E>>,
    op7: IOperator<F, G, IControlledStream<T, F>>,
    op8: IOperator<G, H, IControlledStream<T, G>>,
    op9: IOperator<H, I, IControlledStream<T, H>>,
    ...operators: Array<IOperator<any, any, IControlledStream<any, any>>>
  ): IControlledStream<T, any>
  public liftAll(
    ...operators: Array<IOperator<any, any>>
  ): IControlledStream<T, any> {
    let resultStream: IControlledStream<T, any> = this

    for (let i = 0; i < operators.length; i++) {
      resultStream = resultStream.lift(operators[i])
    }

    return resultStream
  }

  public next(value: T): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (this.isReceivingValues()) {
      const subscribers = this.__targets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].next(value)
      }
    }
  }

  public error(error: unknown): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (this.isReceivingValues()) {
      this.__mutableThrownError.setValue(error)
      this.__onStopReceivingValuesSubscription.dispose()

      const subscribers = this.__targets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].error(error)
      }

      this.__targets.length = 0
    }
  }

  public complete(): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (this.isReceivingValues()) {
      this.__onStopReceivingValuesSubscription.dispose()

      const subscribers = this.__targets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].complete()
      }

      this.__targets.length = 0
    }
  }

  public dispose(): void {
    if (this.isActive()) {
      this.__targets.length = 0
      this.__onStopReceivingValuesSubscription.dispose()
      this.__selfSubscription.dispose()
    }
  }

  public isActive(): boolean {
    return this.__selfSubscription.isActive()
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
    if (!this.__selfSubscription.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.__mutableThrownError.throwValue()

    if (!this.isReceivingValues()) {
      target.complete()
    } else {
      return this.pushTarget(target)
    }
  }

  protected pushTarget(target: ValueTransmitter<T, unknown>): IDisposable {
    this.add(target)
    this.__targets.push(target)

    return new RawControlledStreamSubscriptionDisposable(
      this,
      this.__targets,
      target
    )
  }
}

class LiftedControlledStream<TStreamInput, TOperatorInput, TOperatorOutput>
  extends Stream<TOperatorOutput>
  implements IControlledStream<TStreamInput, TOperatorOutput> {
  public readonly [isSubscriptionPropertyKey] = true;
  public readonly [isReceivingValuesSubscriptionPropertyKey] = true

  private __source: IControlledStream<TStreamInput, TOperatorInput>
  private __operator: IOperator<TOperatorInput, TOperatorOutput>
  private __selfSubscription: ISubscription = new Subscription()
  private __isReceivingValuesSubscription: ISubscription = new Subscription()

  constructor(
    source: IControlledStream<TStreamInput, TOperatorInput>,
    operator: IOperator<TOperatorInput, TOperatorOutput>
  ) {
    super()
    this.__source = source
    this.__operator = operator
    this.__source.add(this.__selfSubscription)
    this.__source
      .getOnStopReceivingValuesSubscription()
      .add(this.__isReceivingValuesSubscription)
  }

  public add(disposable: DisposableLike): void {
    this.__selfSubscription.add(disposable)
  }

  public remove(disposable: DisposableLike): void {
    this.__selfSubscription.remove(disposable)
  }

  public getOnStopReceivingValuesSubscription(): IImmutableSubscriptionView {
    return this.__isReceivingValuesSubscription
  }

  public lift<U>(
    operator: IOperator<TOperatorOutput, U>
  ): IControlledStream<TStreamInput, U> {
    return new LiftedControlledStream<TStreamInput, TOperatorOutput, U>(
      this,
      operator
    )
  }

  public liftAll(): IControlledStream<TStreamInput, TOperatorOutput>
  public liftAll<A>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >
  ): IControlledStream<TStreamInput, A>
  public liftAll<A, B>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IControlledStream<TStreamInput, A>>
  ): IControlledStream<TStreamInput, B>
  public liftAll<A, B, C>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IControlledStream<TStreamInput, A>>,
    op3: IOperator<B, C, IControlledStream<TStreamInput, B>>
  ): IControlledStream<TStreamInput, C>
  public liftAll<A, B, C, D>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IControlledStream<TStreamInput, A>>,
    op3: IOperator<B, C, IControlledStream<TStreamInput, B>>,
    op4: IOperator<C, D, IControlledStream<TStreamInput, C>>
  ): IControlledStream<TStreamInput, D>
  public liftAll<A, B, C, D, E>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IControlledStream<TStreamInput, A>>,
    op3: IOperator<B, C, IControlledStream<TStreamInput, B>>,
    op4: IOperator<C, D, IControlledStream<TStreamInput, C>>,
    op5: IOperator<D, E, IControlledStream<TStreamInput, D>>
  ): IControlledStream<TStreamInput, E>
  public liftAll<A, B, C, D, E, F>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IControlledStream<TStreamInput, A>>,
    op3: IOperator<B, C, IControlledStream<TStreamInput, B>>,
    op4: IOperator<C, D, IControlledStream<TStreamInput, C>>,
    op5: IOperator<D, E, IControlledStream<TStreamInput, D>>,
    op6: IOperator<E, F, IControlledStream<TStreamInput, E>>
  ): IControlledStream<TStreamInput, F>
  public liftAll<A, B, C, D, E, F, G>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IControlledStream<TStreamInput, A>>,
    op3: IOperator<B, C, IControlledStream<TStreamInput, B>>,
    op4: IOperator<C, D, IControlledStream<TStreamInput, C>>,
    op5: IOperator<D, E, IControlledStream<TStreamInput, D>>,
    op6: IOperator<E, F, IControlledStream<TStreamInput, E>>,
    op7: IOperator<F, G, IControlledStream<TStreamInput, F>>
  ): IControlledStream<TStreamInput, G>
  public liftAll<A, B, C, D, E, F, G, H>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IControlledStream<TStreamInput, A>>,
    op3: IOperator<B, C, IControlledStream<TStreamInput, B>>,
    op4: IOperator<C, D, IControlledStream<TStreamInput, C>>,
    op5: IOperator<D, E, IControlledStream<TStreamInput, D>>,
    op6: IOperator<E, F, IControlledStream<TStreamInput, E>>,
    op7: IOperator<F, G, IControlledStream<TStreamInput, F>>,
    op8: IOperator<G, H, IControlledStream<TStreamInput, G>>
  ): IControlledStream<TStreamInput, H>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IControlledStream<TStreamInput, A>>,
    op3: IOperator<B, C, IControlledStream<TStreamInput, B>>,
    op4: IOperator<C, D, IControlledStream<TStreamInput, C>>,
    op5: IOperator<D, E, IControlledStream<TStreamInput, D>>,
    op6: IOperator<E, F, IControlledStream<TStreamInput, E>>,
    op7: IOperator<F, G, IControlledStream<TStreamInput, F>>,
    op8: IOperator<G, H, IControlledStream<TStreamInput, G>>,
    op9: IOperator<H, I, IControlledStream<TStreamInput, H>>
  ): IControlledStream<TStreamInput, I>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: IOperator<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: IOperator<A, B, IControlledStream<TStreamInput, A>>,
    op3: IOperator<B, C, IControlledStream<TStreamInput, B>>,
    op4: IOperator<C, D, IControlledStream<TStreamInput, C>>,
    op5: IOperator<D, E, IControlledStream<TStreamInput, D>>,
    op6: IOperator<E, F, IControlledStream<TStreamInput, E>>,
    op7: IOperator<F, G, IControlledStream<TStreamInput, F>>,
    op8: IOperator<G, H, IControlledStream<TStreamInput, G>>,
    op9: IOperator<H, I, IControlledStream<TStreamInput, H>>,
    ...operators: Array<IOperator<any, any, IControlledStream<any, any>>>
  ): IControlledStream<TStreamInput, any>
  public liftAll(
    ...operators: Array<IOperator<any, any>>
  ): IControlledStream<TStreamInput, any> {
    let resultStream: IControlledStream<TStreamInput, any> = this

    for (let i = 0; i < operators.length; i++) {
      resultStream = resultStream.lift(operators[i])
    }

    return resultStream
  }

  public next(value: TStreamInput): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.__source.next(value)
  }

  public error(error: unknown): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.__source.error(error)
  }

  public complete(): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.__source.complete()
  }

  public dispose(): void {
    this.__isReceivingValuesSubscription.dispose()
    this.__selfSubscription.dispose()
  }

  public isActive(): boolean {
    return this.__selfSubscription.isActive()
  }

  public isReceivingValues(): boolean {
    return this.__isReceivingValuesSubscription.isActive()
  }

  public asStream(): Stream<TOperatorOutput> {
    return new DuplicateStream(this)
  }

  protected trySubscribe(
    target: ValueTransmitter<TOperatorOutput, unknown>
  ): DisposableLike {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.add(target)

    return this.__operator.connect(
      target,
      this.__source
    )
  }
}

class RawControlledStreamSubscriptionDisposable<T> implements IDisposable {
  constructor(
    private distributiveStream: ControlledStream<T>,
    private distributiveStreamTargets: Array<IRequiredSubscriber<T>>,
    private target: IRequiredSubscriber<T>
  ) {}

  public dispose() {
    if (this.distributiveStream.isReceivingValues()) {
      removeOnce(this.distributiveStreamTargets, this.target)
    }
  }
}
