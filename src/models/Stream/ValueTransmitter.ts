import { IDisposable } from 'src/models/Disposable/IDisposable'
import {
  isSubscription,
  RecyclableSubscription
} from 'src/models/Disposable/Subscription'
import { IRequiredSubscriber, ISubscriber } from 'src/models/Stream/ISubscriber'
import { asyncReportError } from 'src/utils/asyncReportError'

export class ValueTransmitter<TInput, TOutput> extends RecyclableSubscription
  implements IRequiredSubscriber<TInput> {
  protected destination: IRequiredSubscriber<TOutput>
  private __isReceivingValues: boolean = true

  constructor(target: ISubscriber<TOutput> | ValueTransmitter<TOutput, any>) {
    super()

    if (isSubscription(target)) {
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

  public error(error: any): void {
    if (this.__isReceivingValues) {
      this.__isReceivingValues = false
      this.onError(error)
    }
  }

  public complete(): void {
    if (this.__isReceivingValues) {
      this.__isReceivingValues = false
      this.onComplete()
    }
  }

  public isReceivingValues(): boolean {
    return this.__isReceivingValues
  }

  public dispose(): void {
    if (this.isActive()) {
      this.__isReceivingValues = false
      super.dispose()
    }
  }

  public recycle(): void {
    this.dispose()
    this.__isReceivingValues = true
    super.recycle()
  }

  protected onNextValue(value: TInput): void {}

  protected onError(error: any): void {
    this.destination.error(error)
    this.dispose()
  }

  protected onComplete(): void {
    this.destination.complete()
    this.dispose()
  }
}

export class MonoTypeValueTransmitter<T> extends ValueTransmitter<T, T> {
  protected onNextValue(value: T): void {
    this.destination.next(value)
  }
}

export function isValueTransmitter(
  value: any
): value is ValueTransmitter<any, any> {
  return value instanceof ValueTransmitter
}

class Destination<T> implements IRequiredSubscriber<T> {
  private __parentDistributor: IDisposable
  private __target: ISubscriber<T>

  constructor(parentDistributor: IDisposable, target: ISubscriber<T>) {
    this.__parentDistributor = parentDistributor
    this.__target = target
  }

  public next(value: T): void {
    if (this.__target.next) {
      try {
        this.__target.next(value)
      } catch (subscriberError) {
        this.__dispose()
        asyncReportError(subscriberError)
      }
    }
  }

  public error(error: any): void {
    if (this.__target.error) {
      try {
        this.__target.error(error)
      } catch (subscriberError) {
        asyncReportError(subscriberError)
      }
    }

    this.__dispose()
    asyncReportError(error)
  }

  public complete(): void {
    if (this.__target.complete) {
      try {
        this.__target.complete()
      } catch (subscriberError) {
        asyncReportError(subscriberError)
      }
    }

    this.__dispose()
  }

  private __dispose(): void {
    this.__parentDistributor.dispose()
  }
}
