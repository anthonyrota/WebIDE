import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import {
  isSubscriptionPropertyKey,
  ISubscription,
  Subscription
} from 'src/models/Disposable/Subscription'
import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import {
  IReceivingValueSubscription,
  isReceivingValuesSubscriptionPropertyKey
} from 'src/models/Stream/IReceivingValuesSubscription'
import { IRequiredSubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { Operation } from 'src/models/Stream/Operation'
import { DuplicateStream, Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { removeOnce } from 'src/utils/removeOnce'

export interface IControlledStream<TInput, TOutput>
  extends Stream<TOutput>,
    ISubscription,
    IReceivingValueSubscription,
    IRequiredSubscriptionTarget<TInput> {
  lift<U>(
    operation: Operation<TOutput, U, IControlledStream<TInput, TOutput>>
  ): IControlledStream<TInput, U>
  liftAll(): IControlledStream<TInput, TOutput>
  liftAll<A>(
    op1: Operation<TOutput, A, IControlledStream<TInput, TOutput>>
  ): IControlledStream<TInput, A>
  liftAll<A, B>(
    op1: Operation<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: Operation<A, B, IControlledStream<TInput, A>>
  ): IControlledStream<TInput, B>
  liftAll<A, B, C>(
    op1: Operation<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: Operation<A, B, IControlledStream<TInput, A>>,
    op3: Operation<B, C, IControlledStream<TInput, B>>
  ): IControlledStream<TInput, C>
  liftAll<A, B, C, D>(
    op1: Operation<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: Operation<A, B, IControlledStream<TInput, A>>,
    op3: Operation<B, C, IControlledStream<TInput, B>>,
    op4: Operation<C, D, IControlledStream<TInput, C>>
  ): IControlledStream<TInput, D>
  liftAll<A, B, C, D, E>(
    op1: Operation<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: Operation<A, B, IControlledStream<TInput, A>>,
    op3: Operation<B, C, IControlledStream<TInput, B>>,
    op4: Operation<C, D, IControlledStream<TInput, C>>,
    op5: Operation<D, E, IControlledStream<TInput, D>>
  ): IControlledStream<TInput, E>
  liftAll<A, B, C, D, E, F>(
    op1: Operation<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: Operation<A, B, IControlledStream<TInput, A>>,
    op3: Operation<B, C, IControlledStream<TInput, B>>,
    op4: Operation<C, D, IControlledStream<TInput, C>>,
    op5: Operation<D, E, IControlledStream<TInput, D>>,
    op6: Operation<E, F, IControlledStream<TInput, E>>
  ): IControlledStream<TInput, F>
  liftAll<A, B, C, D, E, F, G>(
    op1: Operation<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: Operation<A, B, IControlledStream<TInput, A>>,
    op3: Operation<B, C, IControlledStream<TInput, B>>,
    op4: Operation<C, D, IControlledStream<TInput, C>>,
    op5: Operation<D, E, IControlledStream<TInput, D>>,
    op6: Operation<E, F, IControlledStream<TInput, E>>,
    op7: Operation<F, G, IControlledStream<TInput, F>>
  ): IControlledStream<TInput, G>
  liftAll<A, B, C, D, E, F, G, H>(
    op1: Operation<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: Operation<A, B, IControlledStream<TInput, A>>,
    op3: Operation<B, C, IControlledStream<TInput, B>>,
    op4: Operation<C, D, IControlledStream<TInput, C>>,
    op5: Operation<D, E, IControlledStream<TInput, D>>,
    op6: Operation<E, F, IControlledStream<TInput, E>>,
    op7: Operation<F, G, IControlledStream<TInput, F>>,
    op8: Operation<G, H, IControlledStream<TInput, G>>
  ): IControlledStream<TInput, H>
  liftAll<A, B, C, D, E, F, G, H, I>(
    op1: Operation<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: Operation<A, B, IControlledStream<TInput, A>>,
    op3: Operation<B, C, IControlledStream<TInput, B>>,
    op4: Operation<C, D, IControlledStream<TInput, C>>,
    op5: Operation<D, E, IControlledStream<TInput, D>>,
    op6: Operation<E, F, IControlledStream<TInput, E>>,
    op7: Operation<F, G, IControlledStream<TInput, F>>,
    op8: Operation<G, H, IControlledStream<TInput, G>>,
    op9: Operation<H, I, IControlledStream<TInput, H>>
  ): IControlledStream<TInput, I>
  liftAll<A, B, C, D, E, F, G, H, I>(
    op1: Operation<TOutput, A, IControlledStream<TInput, TOutput>>,
    op2: Operation<A, B, IControlledStream<TInput, A>>,
    op3: Operation<B, C, IControlledStream<TInput, B>>,
    op4: Operation<C, D, IControlledStream<TInput, C>>,
    op5: Operation<D, E, IControlledStream<TInput, D>>,
    op6: Operation<E, F, IControlledStream<TInput, E>>,
    op7: Operation<F, G, IControlledStream<TInput, F>>,
    op8: Operation<G, H, IControlledStream<TInput, G>>,
    op9: Operation<H, I, IControlledStream<TInput, H>>,
    ...operations: Array<Operation<any, any, IControlledStream<any, any>>>
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
  private __targets: Array<IRequiredSubscriptionTarget<T>> = []
  private __selfSubscription: ISubscription = new Subscription()
  private __onStopReceivingValuesSubscription: ISubscription = new Subscription()

  public addOnDispose(disposableLike: DisposableLike): void {
    this.__selfSubscription.addOnDispose(disposableLike)
  }

  public removeOnDispose(disposableLike: DisposableLike): void {
    this.__selfSubscription.removeOnDispose(disposableLike)
  }

  public addOnStopReceivingValues(disposableLike: DisposableLike): void {
    this.__onStopReceivingValuesSubscription.addOnDispose(disposableLike)
  }

  public removeOnStopReceivingValues(disposableLike: DisposableLike): void {
    this.__onStopReceivingValuesSubscription.removeOnDispose(disposableLike)
  }

  public isReceivingValues(): boolean {
    return this.__onStopReceivingValuesSubscription.isActive()
  }

  public lift<U>(
    operation: Operation<T, U, IControlledStream<T, T>>
  ): IControlledStream<T, U> {
    return new LiftedControlledStream<T, T, U>(this, operation)
  }

  public liftAll(): IControlledStream<T, T>
  public liftAll<A>(
    op1: Operation<T, A, IControlledStream<T, T>>
  ): IControlledStream<T, A>
  public liftAll<A, B>(
    op1: Operation<T, A, IControlledStream<T, T>>,
    op2: Operation<A, B, IControlledStream<T, A>>
  ): IControlledStream<T, B>
  public liftAll<A, B, C>(
    op1: Operation<T, A, IControlledStream<T, T>>,
    op2: Operation<A, B, IControlledStream<T, A>>,
    op3: Operation<B, C, IControlledStream<T, B>>
  ): IControlledStream<T, C>
  public liftAll<A, B, C, D>(
    op1: Operation<T, A, IControlledStream<T, T>>,
    op2: Operation<A, B, IControlledStream<T, A>>,
    op3: Operation<B, C, IControlledStream<T, B>>,
    op4: Operation<C, D, IControlledStream<T, C>>
  ): IControlledStream<T, D>
  public liftAll<A, B, C, D, E>(
    op1: Operation<T, A, IControlledStream<T, T>>,
    op2: Operation<A, B, IControlledStream<T, A>>,
    op3: Operation<B, C, IControlledStream<T, B>>,
    op4: Operation<C, D, IControlledStream<T, C>>,
    op5: Operation<D, E, IControlledStream<T, D>>
  ): IControlledStream<T, E>
  public liftAll<A, B, C, D, E, F>(
    op1: Operation<T, A, IControlledStream<T, T>>,
    op2: Operation<A, B, IControlledStream<T, A>>,
    op3: Operation<B, C, IControlledStream<T, B>>,
    op4: Operation<C, D, IControlledStream<T, C>>,
    op5: Operation<D, E, IControlledStream<T, D>>,
    op6: Operation<E, F, IControlledStream<T, E>>
  ): IControlledStream<T, F>
  public liftAll<A, B, C, D, E, F, G>(
    op1: Operation<T, A, IControlledStream<T, T>>,
    op2: Operation<A, B, IControlledStream<T, A>>,
    op3: Operation<B, C, IControlledStream<T, B>>,
    op4: Operation<C, D, IControlledStream<T, C>>,
    op5: Operation<D, E, IControlledStream<T, D>>,
    op6: Operation<E, F, IControlledStream<T, E>>,
    op7: Operation<F, G, IControlledStream<T, F>>
  ): IControlledStream<T, G>
  public liftAll<A, B, C, D, E, F, G, H>(
    op1: Operation<T, A, IControlledStream<T, T>>,
    op2: Operation<A, B, IControlledStream<T, A>>,
    op3: Operation<B, C, IControlledStream<T, B>>,
    op4: Operation<C, D, IControlledStream<T, C>>,
    op5: Operation<D, E, IControlledStream<T, D>>,
    op6: Operation<E, F, IControlledStream<T, E>>,
    op7: Operation<F, G, IControlledStream<T, F>>,
    op8: Operation<G, H, IControlledStream<T, G>>
  ): IControlledStream<T, H>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: Operation<T, A, IControlledStream<T, T>>,
    op2: Operation<A, B, IControlledStream<T, A>>,
    op3: Operation<B, C, IControlledStream<T, B>>,
    op4: Operation<C, D, IControlledStream<T, C>>,
    op5: Operation<D, E, IControlledStream<T, D>>,
    op6: Operation<E, F, IControlledStream<T, E>>,
    op7: Operation<F, G, IControlledStream<T, F>>,
    op8: Operation<G, H, IControlledStream<T, G>>,
    op9: Operation<H, I, IControlledStream<T, H>>
  ): IControlledStream<T, I>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: Operation<T, A, IControlledStream<T, T>>,
    op2: Operation<A, B, IControlledStream<T, A>>,
    op3: Operation<B, C, IControlledStream<T, B>>,
    op4: Operation<C, D, IControlledStream<T, C>>,
    op5: Operation<D, E, IControlledStream<T, D>>,
    op6: Operation<E, F, IControlledStream<T, E>>,
    op7: Operation<F, G, IControlledStream<T, F>>,
    op8: Operation<G, H, IControlledStream<T, G>>,
    op9: Operation<H, I, IControlledStream<T, H>>,
    ...operations: Array<Operation<any, any, IControlledStream<any, any>>>
  ): IControlledStream<T, any>
  public liftAll(
    ...operations: Array<Operation<any, any, IControlledStream<any, any>>>
  ): IControlledStream<T, any> {
    let resultStream: IControlledStream<any, any> = this

    for (let i = 0; i < operations.length; i++) {
      resultStream = resultStream.lift(operations[i])
    }

    return resultStream
  }

  public next(value: T): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (this.isReceivingValues()) {
      this.onNextValue(value)
    }
  }

  public error(error: unknown): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (this.isReceivingValues()) {
      this.onError(error)
    }
  }

  public complete(): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (this.isReceivingValues()) {
      this.onComplete()
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

  protected onNextValue(value: T): void {
    const targets = this.__targets.slice()

    for (let i = 0; i < targets.length; i++) {
      targets[i].next(value)
    }
  }

  protected onError(error: unknown): void {
    this.__mutableThrownError.setAs(error)
    this.__onStopReceivingValuesSubscription.dispose()

    const targets = this.__targets.slice()

    for (let i = 0; i < targets.length; i++) {
      targets[i].error(error)
    }

    this.__targets.length = 0
  }

  protected onComplete(): void {
    this.__onStopReceivingValuesSubscription.dispose()

    const targets = this.__targets.slice()

    for (let i = 0; i < targets.length; i++) {
      targets[i].complete()
    }

    this.__targets.length = 0
  }

  protected getThrownError(): MutableMaybe<unknown> {
    return this.__mutableThrownError
  }

  protected trySubscribe(target: ValueTransmitter<T, unknown>): DisposableLike {
    if (!this.__selfSubscription.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.getError().withValue(error => {
      throw error
    })

    if (!this.isReceivingValues()) {
      target.complete()
    } else {
      return this.pushTarget(target)
    }
  }

  protected pushTarget(target: ValueTransmitter<T, unknown>): DisposableLike {
    this.addOnDispose(target)
    this.__targets.push(target)

    return () => {
      if (this.isReceivingValues()) {
        removeOnce(this.__targets, target)
      }
    }
  }

  protected getError(): MutableMaybe<unknown> {
    return this.__mutableThrownError
  }
}

class LiftedControlledStream<TStreamInput, TOperatorInput, TOperatorOutput>
  extends Stream<TOperatorOutput>
  implements IControlledStream<TStreamInput, TOperatorOutput> {
  public readonly [isSubscriptionPropertyKey] = true;
  public readonly [isReceivingValuesSubscriptionPropertyKey] = true

  private __source: IControlledStream<TStreamInput, TOperatorInput>
  private __operation: Operation<
    TOperatorInput,
    TOperatorOutput,
    IControlledStream<TStreamInput, TOperatorInput>
  >
  private __selfSubscription: ISubscription = new Subscription()
  private __isReceivingValuesSubscription: ISubscription = new Subscription()
  private __connectToTarget:
    | ((target: ValueTransmitter<TOperatorOutput, unknown>) => DisposableLike)
    | null = null

  constructor(
    source: IControlledStream<TStreamInput, TOperatorInput>,
    operation: Operation<
      TOperatorInput,
      TOperatorOutput,
      IControlledStream<TStreamInput, TOperatorInput>
    >
  ) {
    super()
    this.__source = source
    this.__operation = operation
    this.__source.addOnDispose(this.__selfSubscription)
    this.__source.addOnStopReceivingValues(this.__isReceivingValuesSubscription)
  }

  public addOnDispose(disposable: DisposableLike): void {
    this.__selfSubscription.addOnDispose(disposable)
  }

  public removeOnDispose(disposable: DisposableLike): void {
    this.__selfSubscription.removeOnDispose(disposable)
  }

  public addOnStopReceivingValues(disposableLike: DisposableLike): void {
    this.__isReceivingValuesSubscription.addOnDispose(disposableLike)
  }

  public removeOnStopReceivingValues(disposableLike: DisposableLike): void {
    this.__isReceivingValuesSubscription.removeOnDispose(disposableLike)
  }

  public lift<U>(
    operation: Operation<
      TOperatorOutput,
      U,
      IControlledStream<TStreamInput, TOperatorOutput>
    >
  ): IControlledStream<TStreamInput, U> {
    return new LiftedControlledStream<TStreamInput, TOperatorOutput, U>(
      this,
      operation
    )
  }

  public liftAll(): IControlledStream<TStreamInput, TOperatorOutput>
  public liftAll<A>(
    op1: Operation<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >
  ): IControlledStream<TStreamInput, A>
  public liftAll<A, B>(
    op1: Operation<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: Operation<A, B, IControlledStream<TStreamInput, A>>
  ): IControlledStream<TStreamInput, B>
  public liftAll<A, B, C>(
    op1: Operation<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: Operation<A, B, IControlledStream<TStreamInput, A>>,
    op3: Operation<B, C, IControlledStream<TStreamInput, B>>
  ): IControlledStream<TStreamInput, C>
  public liftAll<A, B, C, D>(
    op1: Operation<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: Operation<A, B, IControlledStream<TStreamInput, A>>,
    op3: Operation<B, C, IControlledStream<TStreamInput, B>>,
    op4: Operation<C, D, IControlledStream<TStreamInput, C>>
  ): IControlledStream<TStreamInput, D>
  public liftAll<A, B, C, D, E>(
    op1: Operation<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: Operation<A, B, IControlledStream<TStreamInput, A>>,
    op3: Operation<B, C, IControlledStream<TStreamInput, B>>,
    op4: Operation<C, D, IControlledStream<TStreamInput, C>>,
    op5: Operation<D, E, IControlledStream<TStreamInput, D>>
  ): IControlledStream<TStreamInput, E>
  public liftAll<A, B, C, D, E, F>(
    op1: Operation<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: Operation<A, B, IControlledStream<TStreamInput, A>>,
    op3: Operation<B, C, IControlledStream<TStreamInput, B>>,
    op4: Operation<C, D, IControlledStream<TStreamInput, C>>,
    op5: Operation<D, E, IControlledStream<TStreamInput, D>>,
    op6: Operation<E, F, IControlledStream<TStreamInput, E>>
  ): IControlledStream<TStreamInput, F>
  public liftAll<A, B, C, D, E, F, G>(
    op1: Operation<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: Operation<A, B, IControlledStream<TStreamInput, A>>,
    op3: Operation<B, C, IControlledStream<TStreamInput, B>>,
    op4: Operation<C, D, IControlledStream<TStreamInput, C>>,
    op5: Operation<D, E, IControlledStream<TStreamInput, D>>,
    op6: Operation<E, F, IControlledStream<TStreamInput, E>>,
    op7: Operation<F, G, IControlledStream<TStreamInput, F>>
  ): IControlledStream<TStreamInput, G>
  public liftAll<A, B, C, D, E, F, G, H>(
    op1: Operation<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: Operation<A, B, IControlledStream<TStreamInput, A>>,
    op3: Operation<B, C, IControlledStream<TStreamInput, B>>,
    op4: Operation<C, D, IControlledStream<TStreamInput, C>>,
    op5: Operation<D, E, IControlledStream<TStreamInput, D>>,
    op6: Operation<E, F, IControlledStream<TStreamInput, E>>,
    op7: Operation<F, G, IControlledStream<TStreamInput, F>>,
    op8: Operation<G, H, IControlledStream<TStreamInput, G>>
  ): IControlledStream<TStreamInput, H>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: Operation<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: Operation<A, B, IControlledStream<TStreamInput, A>>,
    op3: Operation<B, C, IControlledStream<TStreamInput, B>>,
    op4: Operation<C, D, IControlledStream<TStreamInput, C>>,
    op5: Operation<D, E, IControlledStream<TStreamInput, D>>,
    op6: Operation<E, F, IControlledStream<TStreamInput, E>>,
    op7: Operation<F, G, IControlledStream<TStreamInput, F>>,
    op8: Operation<G, H, IControlledStream<TStreamInput, G>>,
    op9: Operation<H, I, IControlledStream<TStreamInput, H>>
  ): IControlledStream<TStreamInput, I>
  public liftAll<A, B, C, D, E, F, G, H, I>(
    op1: Operation<
      TOperatorOutput,
      A,
      IControlledStream<TStreamInput, TOperatorOutput>
    >,
    op2: Operation<A, B, IControlledStream<TStreamInput, A>>,
    op3: Operation<B, C, IControlledStream<TStreamInput, B>>,
    op4: Operation<C, D, IControlledStream<TStreamInput, C>>,
    op5: Operation<D, E, IControlledStream<TStreamInput, D>>,
    op6: Operation<E, F, IControlledStream<TStreamInput, E>>,
    op7: Operation<F, G, IControlledStream<TStreamInput, F>>,
    op8: Operation<G, H, IControlledStream<TStreamInput, G>>,
    op9: Operation<H, I, IControlledStream<TStreamInput, H>>,
    ...operations: Array<Operation<any, any, IControlledStream<any, any>>>
  ): IControlledStream<TStreamInput, any>
  public liftAll(
    ...operations: Array<Operation<any, any, IControlledStream<any, any>>>
  ): IControlledStream<TStreamInput, any> {
    let resultStream: IControlledStream<any, any> = this

    for (let i = 0; i < operations.length; i++) {
      resultStream = resultStream.lift(operations[i])
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

    this.addOnDispose(target)

    if (!this.__connectToTarget) {
      this.__connectToTarget = this.__operation(this.__source)
    }

    return this.__connectToTarget(target)
  }
}
