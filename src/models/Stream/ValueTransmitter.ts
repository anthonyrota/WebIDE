import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import {
  isSubscription,
  ISubscription,
  RecyclableSubscription,
  Subscription
} from 'src/models/Disposable/Subscription'
import {
  IReceivingValueSubscription,
  isReceivingValuesSubscription,
  isReceivingValuesSubscriptionPropertyKey
} from 'src/models/Stream/IReceivingValuesSubscription'
import { IRequiredSubscriptionTarget, ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { asyncReportError } from 'src/utils/asyncReportError'

export class ValueTransmitter<TInput, TOutput> extends RecyclableSubscription
  implements IRequiredSubscriptionTarget<TInput>, IReceivingValueSubscription {
  public readonly [isReceivingValuesSubscriptionPropertyKey] = true
  protected destination: IRequiredSubscriptionTarget<TOutput>
  private __isReceivingValues: boolean = true
  private __onStopReceivingValuesSubscription = new RecyclableSubscription()

  constructor(
    target:
      | ISubscriptionTarget<TOutput>
      | (IReceivingValueSubscription & ISubscriptionTarget<TOutput>)
      | (ISubscription & ISubscriptionTarget<TOutput>)
  ) {
    super()

    if (isReceivingValuesSubscription(target)) {
      target.addOnStopReceivingValues(this)
    } else if (isSubscription(target)) {
      target.addOnDispose(this)
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

  public addOnStopReceivingValues(disposableLike: DisposableLike): void {
    this.__onStopReceivingValuesSubscription.addOnDispose(disposableLike)
  }

  public removeOnStopReceivingValues(disposableLike: DisposableLike): void {
    this.__onStopReceivingValuesSubscription.removeOnDispose(disposableLike)
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
  implements IRequiredSubscriptionTarget<T>, IReceivingValueSubscription {
  public readonly [isReceivingValuesSubscriptionPropertyKey] = true
  private __parentDistributor: IDisposable
  private __target: ISubscriptionTarget<T>

  constructor(parentDistributor: IDisposable, target: ISubscriptionTarget<T>) {
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

  public addOnStopReceivingValues(disposableLike: DisposableLike): void {
    this.addOnDispose(disposableLike)
  }

  public removeOnStopReceivingValues(disposableLike: DisposableLike): void {
    this.removeOnDispose(disposableLike)
  }

  public isReceivingValues(): boolean {
    return this.isActive()
  }
}
