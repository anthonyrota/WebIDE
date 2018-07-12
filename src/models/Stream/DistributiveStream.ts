import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  ImmutableMutableMaybeView,
  MutableMaybe
} from 'src/models/Maybe/MutableMaybe'
import { IOperator } from 'src/models/Stream/IOperator'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'
import { DuplicateStream, Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { removeOnce } from 'src/utils/removeOnce'

export interface IDistributiveStream<TInput, TOutput>
  extends Stream<TOutput>,
    IConsciousDisposable,
    IRequiredSubscriber<TInput> {
  lift<TNewOutput>(
    operator: IOperator<TOutput, TNewOutput>
  ): IDistributiveStream<TInput, TNewOutput>
  isCompleted(): boolean
  asStream(): Stream<TOutput>
}

export class DistributiveStream<T> extends Stream<T>
  implements IDistributiveStream<T, T> {
  private __mutableThrownError: MutableMaybe<any> = MutableMaybe.none<any>()
  private __subscriptionTargets: Array<SubscriptionTarget<T>>
  private __isDisposed: boolean = true
  private __isCompleted: boolean = false

  public lift<U>(operator: IOperator<T, U>): IDistributiveStream<T, U> {
    return new LiftedDistributiveStream<T, T, U>(this, operator)
  }

  public next(value: T): void {
    if (this.__isDisposed) {
      throw new AlreadyDisposedError()
    }

    if (!this.__isCompleted) {
      const subscribers = this.__subscriptionTargets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].next(value)
      }
    }
  }

  public error(error: any): void {
    if (this.__isDisposed) {
      throw new AlreadyDisposedError()
    }

    if (!this.__isCompleted) {
      this.__mutableThrownError.setValue(error)
      this.__isCompleted = true

      const subscribers = this.__subscriptionTargets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].error(error)
      }

      this.__subscriptionTargets.length = 0
    }
  }

  public complete(): void {
    if (this.__isDisposed) {
      throw new AlreadyDisposedError()
    }

    if (!this.__isCompleted) {
      this.__isCompleted = true

      const subscribers = this.__subscriptionTargets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].complete()
      }

      this.__subscriptionTargets.length = 0
    }
  }

  public dispose(): void {
    this.__isCompleted = true
    this.__isDisposed = true
    this.__subscriptionTargets.length = 0
  }

  public isActive(): boolean {
    return !this.__isDisposed
  }

  public isCompleted(): boolean {
    return this.__isCompleted
  }

  public asStream(): Stream<T> {
    return new DuplicateStream<T>(this)
  }

  protected getThrownError(): ImmutableMutableMaybeView<any> {
    return this.__mutableThrownError.getImmutableView()
  }

  protected trySubscribe(target: SubscriptionTarget<T>): IDisposableLike {
    if (this.__isDisposed) {
      throw new AlreadyDisposedError()
    }

    this.__mutableThrownError.throwValue()

    if (this.__isCompleted) {
      target.complete()
    } else {
      this.__subscriptionTargets.push(target)

      return new RawDistributiveStreamSubscriptionDisposable(
        this,
        this.__subscriptionTargets,
        target
      )
    }
  }

  protected pushSubscriptionTarget(target: SubscriptionTarget<T>): IDisposable {
    this.__subscriptionTargets.push(target)

    return new RawDistributiveStreamSubscriptionDisposable(
      this,
      this.__subscriptionTargets,
      target
    )
  }
}

class LiftedDistributiveStream<TStreamInput, TOperatorInput, TOperatorOutput>
  extends Stream<TOperatorOutput>
  implements IDistributiveStream<TStreamInput, TOperatorOutput> {
  private __source: IDistributiveStream<TStreamInput, TOperatorInput>
  private __operator: IOperator<TOperatorInput, TOperatorOutput>
  private __isDisposed: boolean = false

  constructor(
    source: IDistributiveStream<TStreamInput, TOperatorInput>,
    operator: IOperator<TOperatorInput, TOperatorOutput>
  ) {
    super()
    this.__source = source
    this.__operator = operator
  }

  public lift<T>(
    operator: IOperator<TOperatorOutput, T>
  ): IDistributiveStream<TStreamInput, T> {
    return new LiftedDistributiveStream<TStreamInput, TOperatorOutput, T>(
      this,
      operator
    )
  }

  public next(value: TStreamInput): void {
    if (this.__isDisposed || !this.__source.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.__source.next(value)
  }

  public error(error: any): void {
    if (this.__isDisposed || !this.__source.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.__source.error(error)
  }

  public complete(): void {
    if (this.__isDisposed || !this.__source.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.__source.complete()
  }

  public dispose(): void {
    this.__isDisposed = true
  }

  public isActive(): boolean {
    return !this.__isDisposed && this.__source.isActive()
  }

  public isCompleted(): boolean {
    return this.__source.isCompleted()
  }

  public asStream(): Stream<TOperatorOutput> {
    return new DuplicateStream(this)
  }

  protected trySubscribe(
    target: SubscriptionTarget<TOperatorOutput>
  ): IDisposableLike {
    if (this.__isDisposed || !this.__source.isActive()) {
      throw new AlreadyDisposedError()
    }

    return this.__operator.call(target, this.__source)
  }
}

class RawDistributiveStreamSubscriptionDisposable<T> implements IDisposable {
  constructor(
    private distributiveStream: DistributiveStream<T>,
    private distributiveStreamSubscriptionTargets: Array<SubscriptionTarget<T>>,
    private target: SubscriptionTarget<T>
  ) {}

  public dispose() {
    if (!this.distributiveStream.isCompleted()) {
      removeOnce(this.target, this.distributiveStreamSubscriptionTargets)
    }
  }
}
