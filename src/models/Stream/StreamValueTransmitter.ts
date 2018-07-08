import { CompositeDisposable } from 'src/models/Disposable/CompositeDisposable'
import { Disposable } from 'src/models/Disposable/Disposable'
import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import {
  IStreamSubscriber,
  IRecyclableRequiredStreamSubscriber
} from 'src/models/Stream/IStreamSubscriber'
import { reportError } from 'src/utils/reportError'

function connectTransmitters(
  a: StreamValueTransmitter<any, any>,
  b: StreamValueTransmitter<any, any>
): void {
  a.terminateDisposableWhenDisposed(b)
  b.terminateDisposableWhenDisposed(a)
}

export abstract class StreamValueTransmitter<TInput, TOutput>
  implements IConsciousDisposable, IRecyclableRequiredStreamSubscriber<TInput> {
  protected destination: IRecyclableRequiredStreamSubscriber<TOutput>
  private __onDisposeListeners: CompositeDisposable
  private __isActive: boolean

  constructor(
    target: IStreamSubscriber<TOutput> | StreamValueTransmitter<TOutput, any>
  ) {
    if (isStreamValueTransmitter(target)) {
      connectTransmitters(this, target)
      this.destination = target
    } else {
      this.destination = new StreamDestination(this, target)
    }
    this.__onDisposeListeners = new CompositeDisposable()
    this.__isActive = true
  }

  public next(value: TInput): void {
    if (this.__isActive) {
      this.onNextValue(value)
    }
  }

  public error(error: any): void {
    if (this.__isActive) {
      this.__isActive = false
      this.onError(error)
    }
  }

  public complete(): void {
    if (this.__isActive) {
      this.__isActive = false
      this.onComplete()
    }
  }

  public isActive(): boolean {
    return this.__isActive
  }

  public dispose(): void {
    if (this.__isActive) {
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
    this.destination.recycle()
    this.__onDisposeListeners.recycle()
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
}

export class MonoTypeStreamValueTransmitter<T> extends StreamValueTransmitter<
  T,
  T
> {
  protected onNextValue(value: T): void {
    this.destination.next(value)
  }
}

export function isStreamValueTransmitter(
  value: any
): value is StreamValueTransmitter<any, any> {
  return value instanceof StreamValueTransmitter
}

class StreamDestination<T> implements IRecyclableRequiredStreamSubscriber<T> {
  private __isActive: boolean
  private __parentDistributor: IDisposable
  private __target: IStreamSubscriber<T>

  constructor(parentDistributor: IDisposable, target: IStreamSubscriber<T>) {
    this.__isActive = true
    this.__parentDistributor = parentDistributor
    this.__target = target
  }

  public next(value: T): void {
    if (this.__isActive && this.__target.next) {
      try {
        this.__target.next(value)
      } catch (subscriberError) {
        this.__dispose()
        reportError(subscriberError)
      }
    }
  }

  public error(error: any): void {
    if (this.__isActive) {
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
  }

  public complete(): void {
    if (this.__isActive) {
      if (this.__target.complete) {
        try {
          this.__target.complete()
        } catch (subscriberError) {
          reportError(subscriberError)
        }
      }

      this.__dispose()
    }
  }

  public recycle(): void {
    this.__isActive = true
  }

  private __dispose(): void {
    this.__isActive = false
    this.__parentDistributor.dispose()
  }
}
