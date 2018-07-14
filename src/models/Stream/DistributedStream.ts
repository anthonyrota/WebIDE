import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { ISubscription } from 'src/models/Disposable/Subscription'
import {
  ImmutableMutableMaybeView,
  MutableMaybe
} from 'src/models/Maybe/MutableMaybe'
import { IOperator } from 'src/models/Stream/IOperator'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'
import { DuplicateStream, Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { removeOnce } from 'src/utils/removeOnce'

export interface IDistributedStream<TInput, TOutput>
  extends Stream<TOutput>,
    ISubscription,
    IRequiredSubscriber<TInput> {
  lift<TNewOutput>(
    operator: IOperator<TOutput, TNewOutput>
  ): IDistributedStream<TInput, TNewOutput>
  isCompleted(): boolean
  asStream(): Stream<TOutput>
}

export class DistributedStream<T> extends Stream<T>
  implements IDistributedStream<T, T> {
  private __mutableThrownError: MutableMaybe<any> = MutableMaybe.none<any>()
  private __targets: Array<MonoTypeValueTransmitter<T>>
  private __isCompleted: boolean = false
  private __selfSubscription: ISubscription

  public onDispose(dispose: () => void): ISubscription {
    return this.__selfSubscription.onDispose(dispose)
  }

  public terminateDisposableWhenDisposed(
    disposable: IDisposable
  ): ISubscription {
    return this.__selfSubscription.terminateDisposableWhenDisposed(disposable)
  }

  public removeSubscription(subscription: ISubscription): void {
    this.__selfSubscription.removeSubscription(subscription)
  }

  public lift<U>(operator: IOperator<T, U>): IDistributedStream<T, U> {
    return new LiftedDistributedStream<T, T, U>(this, operator)
  }

  public next(value: T): void {
    if (this.__selfSubscription.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    if (!this.__isCompleted) {
      const subscribers = this.__targets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].next(value)
      }
    }
  }

  public error(error: any): void {
    if (this.__selfSubscription.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    if (!this.__isCompleted) {
      this.__mutableThrownError.setValue(error)
      this.__isCompleted = true

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

    if (!this.__isCompleted) {
      this.__isCompleted = true

      const subscribers = this.__targets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].complete()
      }

      this.__targets.length = 0
    }
  }

  public dispose(): void {
    this.__isCompleted = true
    this.__targets.length = 0
    this.__selfSubscription.dispose()
  }

  public isActive(): boolean {
    return this.__selfSubscription.isActive()
  }

  public isDisposed(): boolean {
    return this.__selfSubscription.isDisposed()
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

  protected throwError(): void {
    this.__mutableThrownError.throwValue()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    if (this.__selfSubscription.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    this.__mutableThrownError.throwValue()

    if (this.__isCompleted) {
      target.complete()
    } else {
      return this.pushTarget(target)
    }
  }

  protected pushTarget(target: MonoTypeValueTransmitter<T>): IDisposable {
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
  private __source: IDistributedStream<TStreamInput, TOperatorInput>
  private __operator: IOperator<TOperatorInput, TOperatorOutput>
  private __selfSubscription: ISubscription

  constructor(
    source: IDistributedStream<TStreamInput, TOperatorInput>,
    operator: IOperator<TOperatorInput, TOperatorOutput>
  ) {
    super()
    this.__source = source
    this.__operator = operator
  }

  public onDispose(dispose: () => void): ISubscription {
    return this.__selfSubscription.onDispose(dispose)
  }

  public terminateDisposableWhenDisposed(
    disposable: IDisposable
  ): ISubscription {
    return this.__selfSubscription.terminateDisposableWhenDisposed(disposable)
  }

  public removeSubscription(subscription: ISubscription): void {
    this.__selfSubscription.removeSubscription(subscription)
  }

  public lift<T>(
    operator: IOperator<TOperatorOutput, T>
  ): IDistributedStream<TStreamInput, T> {
    return new LiftedDistributedStream<TStreamInput, TOperatorOutput, T>(
      this,
      operator
    )
  }

  public next(value: TStreamInput): void {
    if (this.__selfSubscription.isDisposed() || this.__source.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    this.__source.next(value)
  }

  public error(error: any): void {
    if (this.__selfSubscription.isDisposed() || this.__source.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    this.__source.error(error)
  }

  public complete(): void {
    if (this.__selfSubscription.isDisposed() || this.__source.isDisposed()) {
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

  public isCompleted(): boolean {
    return this.__source.isCompleted()
  }

  public asStream(): Stream<TOperatorOutput> {
    return new DuplicateStream(this)
  }

  protected trySubscribe(
    target: MonoTypeValueTransmitter<TOperatorOutput>
  ): IDisposableLike {
    if (this.__selfSubscription.isDisposed() || this.__source.isDisposed()) {
      throw new AlreadyDisposedError()
    }

    return this.__operator.call(target, this.__source)
  }
}

class RawDistributedStreamSubscriptionDisposable<T> implements IDisposable {
  constructor(
    private distributiveStream: DistributedStream<T>,
    private distributiveStreamTargets: Array<MonoTypeValueTransmitter<T>>,
    private target: MonoTypeValueTransmitter<T>
  ) {}

  public dispose() {
    if (!this.distributiveStream.isCompleted()) {
      removeOnce(this.target, this.distributiveStreamTargets)
    }
  }
}
