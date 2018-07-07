import { CompositeDisposable } from 'src/models/Disposable/CompositeDisposable'
import { Disposable } from 'src/models/Disposable/Disposable'
import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import {
  IRequiredStreamSubscriber,
  IStreamSubscriber
} from 'src/models/Stream/IStreamSubscriber'
import { reportError } from 'src/utils/reportError'

export abstract class StreamDistributor<TInput, TOutput>
  implements IConsciousDisposable, IRequiredStreamSubscriber<TInput> {
  protected destination: IRequiredStreamSubscriber<TOutput>
  private __onDisposeListeners: CompositeDisposable
  private __isActive: boolean

  constructor(target: IStreamSubscriber<TOutput>) {
    this.destination = new StreamDestination(this, target)
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

  protected abstract onNextValue(value: TInput): void

  protected onError(error: any): void {
    this.destination.error(error)
  }

  protected onComplete(): void {
    this.destination.complete()
  }

  protected recycle(): void {
    this.__onDisposeListeners.recycle()
  }
}

export class MonoTypeStreamDistributor<T> extends StreamDistributor<T, T> {
  protected onNextValue(value: T): void {
    this.destination.next(value)
  }
}

class StreamDestination<T> implements IRequiredStreamSubscriber<T> {
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

  private __dispose(): void {
    this.__isActive = false
    this.__parentDistributor.dispose()
  }
}
