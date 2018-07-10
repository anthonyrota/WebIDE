import { CompositeDisposable } from 'src/models/Disposable/CompositeDisposable'
import { Disposable } from 'src/models/Disposable/Disposable'
import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { IRecyclable } from 'src/models/Disposable/IRecyclable'
import {
  IRequiredSubscriber,
  ISubscriber
} from 'src/models/Stream/ISubscriber'
import { reportError } from 'src/utils/reportError'

export abstract class ValueTransmitter<TInput, TOutput>
  implements IConsciousDisposable, IRequiredSubscriber<TInput>, IRecyclable {
  protected destination: IRequiredSubscriber<TOutput>
  private __onDisposeListeners: CompositeDisposable
  private __isReceivingValues: boolean
  private __isActive: boolean

  constructor(target: ISubscriber<TOutput> | ValueTransmitter<TOutput, any>) {
    if (isValueTransmitter(target)) {
      target.terminateDisposableWhenDisposed(this)
      this.destination = target
    } else {
      this.destination = new Destination(this, target)
    }
    this.__onDisposeListeners = new CompositeDisposable()
    this.__isReceivingValues = true
    this.__isActive = true
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
      this.onBeforeComplete()
      this.__isReceivingValues = false
      this.onComplete()
    }
  }

  public isActive(): boolean {
    return this.__isActive
  }

  public isReceivingValues(): boolean {
    return this.__isReceivingValues
  }

  public dispose(): void {
    if (this.__isReceivingValues) {
      this.__isReceivingValues = false
      this.__isActive = false
      this.__onDisposeListeners.dispose()
    }
  }

  public onDispose(callback: () => void): IConsciousDisposable {
    return this.__onDisposeListeners.addDisposableAndReturnSubscription(
      new Disposable(callback)
    )
  }

  public terminateDisposableWhenDisposed(
    disposable: IDisposable
  ): IConsciousDisposable {
    return this.__onDisposeListeners.addDisposableAndReturnSubscription(
      disposable
    )
  }

  public recycle(): void {
    this.__onDisposeListeners.recycle()
    this.__isReceivingValues = true
    this.__isActive = true
  }

  protected abstract onNextValue(value: TInput): void

  protected onError(error: any): void {
    this.destination.error(error)
    this.dispose()
  }

  protected onComplete(): void {
    this.destination.complete()
    this.dispose()
  }

  protected onBeforeComplete() {}
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
        reportError(subscriberError)
      }
    }
  }

  public error(error: any): void {
    if (this.__target.error) {
      try {
        this.__target.error(error)
      } catch (subscriberError) {
        reportError(subscriberError)
      }
    }

    this.__dispose()
    reportError(error)
  }

  public complete(): void {
    if (this.__target.complete) {
      try {
        this.__target.complete()
      } catch (subscriberError) {
        reportError(subscriberError)
      }
    }

    this.__dispose()
  }

  private __dispose(): void {
    this.__parentDistributor.dispose()
  }
}
