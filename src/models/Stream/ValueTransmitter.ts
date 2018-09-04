import { IDisposable } from 'src/models/Disposable/IDisposable'
import {
  isSubscription,
  ISubscription,
  RecyclableSubscription,
  Subscription
} from 'src/models/Disposable/Subscription'
import {
  IReceivingValuesSubscription,
  isReceivingValuesSubscription,
  isReceivingValuesSubscriptionPropertyKey
} from 'src/models/Stream/IReceivingValuesSubscription'
import { IRequiredSubscriber, ISubscriber } from 'src/models/Stream/ISubscriber'
import { asyncReportError } from 'src/utils/asyncReportError'

export class ValueTransmitter<TInput, TOutput> extends RecyclableSubscription
  implements IRequiredSubscriber<TInput>, IReceivingValuesSubscription {
  public readonly [isReceivingValuesSubscriptionPropertyKey] = true
  protected destination: IRequiredSubscriber<TOutput>
  private __isReceivingValues: boolean = true
  private __onStopReceivingValuesSubscription = new RecyclableSubscription()

  constructor(
    target:
      | ISubscriber<TOutput>
      | (IReceivingValuesSubscription & ISubscriber<TOutput>)
      | (ISubscription & ISubscriber<TOutput>)
  ) {
    super()

    if (isReceivingValuesSubscription(target)) {
      target.terminateDisposableWhenStopsReceivingValues(this)
    } else if (isSubscription(target)) {
      target.terminateDisposableWhenDisposed(this)
    }

    this.destination = isValueTransmitter(target)
      ? target
      : new Destination(this, target)
  }

  public next(value: TInput): void {
    if (this.__isReceivingValues) {
      this.onNextValue(value)
    }
  }

  public error(error: unknown): void {
    if (this.__isReceivingValues) {
      this.__isReceivingValues = false
      this.onError(error)
      this.__onStopReceivingValuesSubscription.dispose()
    }
  }

  public complete(): void {
    if (this.__isReceivingValues) {
      this.__isReceivingValues = false
      this.onComplete()
      this.__onStopReceivingValuesSubscription.dispose()
    }
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

  public isReceivingValues(): boolean {
    return this.__isReceivingValues
  }

  public dispose(): void {
    if (this.isActive()) {
      this.__isReceivingValues = false
      this.__onStopReceivingValuesSubscription.dispose()
      super.dispose()
    }
  }

  public disposeAndRecycle(): void {
    this.__isReceivingValues = false
    this.__onStopReceivingValuesSubscription.disposeAndRecycle()
    super.disposeAndRecycle()
    this.__isReceivingValues = true
  }

  protected onNextValue(value: TInput): void {}

  protected onError(error: unknown): void {
    this.destination.error(error)
  }

  protected onComplete(): void {
    this.destination.complete()
  }
}

export class MonoTypeValueTransmitter<T> extends ValueTransmitter<T, T> {
  protected onNextValue(value: T): void {
    this.destination.next(value)
  }
}

export function isValueTransmitter(
  value: unknown
): value is ValueTransmitter<unknown, unknown> {
  return value instanceof ValueTransmitter
}

class Destination<T> extends Subscription
  implements IRequiredSubscriber<T>, IReceivingValuesSubscription {
  public readonly [isReceivingValuesSubscriptionPropertyKey] = true
  private __parentDistributor: IDisposable
  private __target: ISubscriber<T>

  constructor(parentDistributor: IDisposable, target: ISubscriber<T>) {
    super()
    this.__parentDistributor = parentDistributor
    this.__target = target
  }

  public next(value: T): void {
    if (this.isActive()) {
      if (this.__target.next) {
        try {
          this.__target.next(value)
        } catch (targetError) {
          this.dispose()
          asyncReportError(targetError)
        }
      }
    }
  }

  public error(error: unknown): void {
    if (this.isActive()) {
      if (this.__target.error) {
        try {
          this.__target.error(error)
        } catch (targetError) {
          asyncReportError(targetError)
        }
      } else {
        asyncReportError(error)
      }

      this.dispose()
    }
  }

  public complete(): void {
    if (this.isActive()) {
      if (this.__target.complete) {
        try {
          this.__target.complete()
        } catch (targetError) {
          asyncReportError(targetError)
        }
      }

      this.dispose()
    }
  }

  public dispose(): void {
    super.dispose()
    this.__parentDistributor.dispose()
  }

  public terminateDisposableWhenStopsReceivingValues(
    disposable: IDisposable
  ): ISubscription {
    return this.terminateDisposableWhenDisposed(disposable)
  }

  public terminateDisposableLikeWhenStopsReceivingValues(
    disposableLike: IDisposable
  ): ISubscription {
    return this.terminateDisposableLikeWhenDisposed(disposableLike)
  }

  public onStopReceivingValues(dispose: () => void): ISubscription {
    return this.onDispose(dispose)
  }

  public removeOnStopReceivingValuesSubscription(
    subscription: ISubscription
  ): void {
    this.removeSubscription(subscription)
  }

  public isReceivingValues(): boolean {
    return this.isActive()
  }
}
