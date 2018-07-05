import { CompositeDisposable } from 'src/models/Disposable/CompositeDisposable'
import { Disposable } from 'src/models/Disposable/Disposable'
import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import {
  IRequiredStreamSubscriber,
  IStreamSubscriber
} from 'src/models/Stream/IStreamSubscriber'
import { reportError } from 'src/utils/reportError'

export class StreamDistributor<T>
  implements IConsciousDisposable, IRequiredStreamSubscriber<T> {
  protected destination: IRequiredStreamSubscriber<T>
  private __onDisposeListeners: CompositeDisposable
  private __isActive: boolean

  constructor(subscriber: IStreamSubscriber<T>) {
    this.destination = new StreamDestination(this, subscriber)
    this.__onDisposeListeners = new CompositeDisposable()
    this.__isActive = true
  }

  public onNextValue(value: T): void {
    if (this.__isActive) {
      this.onShouldDistributeValue(value)
    }
  }

  public onError(error: any): void {
    if (this.__isActive) {
      this.__isActive = false
      this.onShouldDistributeError(error)
    }
  }

  public onComplete(): void {
    if (this.__isActive) {
      this.__isActive = false
      this.onShouldComplete()
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

  protected onShouldDistributeValue(value: T): void {
    this.destination.onNextValue(value)
  }

  protected onShouldDistributeError(error: any): void {
    this.destination.onError(error)
  }

  protected onShouldComplete(): void {
    this.destination.onComplete()
  }
}

class StreamDestination<T> implements IRequiredStreamSubscriber<T> {
  private __isActive: boolean
  private __distributor: StreamDistributor<T>
  private __subscriber: IStreamSubscriber<T>

  constructor(
    distributor: StreamDistributor<T>,
    subscriber: IStreamSubscriber<T>
  ) {
    this.__isActive = true
    this.__distributor = distributor
    this.__subscriber = subscriber
  }

  public onNextValue(value: T): void {
    if (this.__isActive && this.__subscriber.onNextValue) {
      try {
        this.__subscriber.onNextValue(value)
      } catch (subscriberError) {
        this.__dispose()
        reportError(subscriberError)
      }
    }
  }

  public onError(error: any): void {
    if (this.__isActive) {
      if (this.__subscriber.onError) {
        try {
          this.__subscriber.onError(error)
        } catch (subscriberError) {
          reportError(subscriberError)
        }
      }

      this.__dispose()
      reportError(error)
    }
  }

  public onComplete(): void {
    if (this.__isActive) {
      if (this.__subscriber.onComplete) {
        try {
          this.__subscriber.onComplete()
        } catch (subscriberError) {
          reportError(subscriberError)
        }
      }

      this.__dispose()
    }
  }

  private __dispose(): void {
    this.__isActive = false
    this.__distributor.dispose()
  }
}
