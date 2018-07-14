import { IDisposable } from 'src/models/Disposable/IDisposable'
import { freeze } from 'src/utils/freeze'
import { indexOf } from 'src/utils/indexOf'
import { removeOnce } from 'src/utils/removeOnce'

export interface ISubscription {
  terminateDisposableWhenDisposed(disposable: IDisposable): ISubscription
  onDispose(dispose: () => void): ISubscription
  removeSubscription(subscription: ISubscription): void
  dispose(): void
  isActive(): boolean
  isDisposed(): boolean
}

export const emptySubscription: ISubscription = freeze({
  terminateDisposableWhenDisposed(disposable: IDisposable): ISubscription {
    disposable.dispose()
    return disposable instanceof Subscription ? disposable : emptySubscription
  },
  onDispose(dispose: () => void): ISubscription {
    dispose()
    return emptySubscription
  },
  removeSubscription(subscription: ISubscription): void {},
  dispose(): void {},
  isActive(): boolean {
    return false
  },
  isDisposed(): boolean {
    return true
  }
})

export class Subscription implements ISubscription {
  private __isActive: boolean = true
  private __parents: ISubscription[] = []
  private __subscriptions: ISubscription[] = []
  private __staticMethod$fromDisposable$$internalDisposable?: IDisposable

  public static fromDisposable(disposable: IDisposable): Subscription {
    const subscription = new Subscription()
    subscription.__staticMethod$fromDisposable$$internalDisposable = disposable
    return subscription
  }

  public terminateDisposableWhenDisposed(
    disposable: IDisposable
  ): ISubscription {
    if (!this.__isActive) {
      disposable.dispose()
      return disposable instanceof Subscription ? disposable : emptySubscription
    }

    if (disposable === emptySubscription) {
      return emptySubscription
    }

    if (disposable === this) {
      return this
    }

    let subscription: Subscription

    if (disposable instanceof Subscription) {
      if (!disposable.isActive()) {
        return disposable
      }

      subscription = disposable

      if (indexOf(subscription, this.__subscriptions) !== -1) {
        return subscription
      }
    } else {
      subscription = Subscription.fromDisposable(disposable)
    }

    subscription.__addParent(this)
    this.__subscriptions.push(subscription)

    return subscription
  }

  public onDispose(dispose: () => void): ISubscription {
    if (this.__isActive) {
      const subscription = Subscription.fromDisposable({ dispose })
      subscription.__addParent(this)
      this.__subscriptions.push(subscription)
      return subscription
    } else {
      dispose()
      return emptySubscription
    }
  }

  public removeSubscription(subscription: ISubscription): void {
    if (this.__isActive) {
      removeOnce(subscription, this.__subscriptions)
    }
  }

  public dispose(): void {
    if (this.__isActive) {
      this.__disposeDisposables()
      this.__isActive = false
    }
  }

  public isActive(): boolean {
    return this.__isActive
  }

  public isDisposed(): boolean {
    return !this.__isActive
  }

  protected __class$$RecyclableSubscription$$unsafePrivateRecycleMethod$$(): void {
    this.__disposeDisposables()
    this.__isActive = true
  }

  private __disposeDisposables(): void {
    if (!this.__isActive) {
      return
    }

    const errors: any[] = []

    for (let i = 0; i < this.__parents.length; i++) {
      this.__parents[i].removeSubscription(this)
    }

    if (this.__staticMethod$fromDisposable$$internalDisposable) {
      try {
        this.__staticMethod$fromDisposable$$internalDisposable.dispose()
      } catch (error) {
        errors.push(error)
      }
    }

    for (let i = 0; i < this.__subscriptions.length; i++) {
      try {
        this.__subscriptions[i].dispose()
      } catch (error) {
        errors.push(error)
      }
    }

    this.__parents.length = 0
    this.__subscriptions.length = 0

    if (errors.length > 0) {
      throw new Error(
        `The following errors occured when disposing the subscription: ${errors.join(
          ', '
        )}`
      )
    }
  }

  private __addParent(parent: ISubscription): void {
    if (this.__isActive) {
      const index = indexOf(parent, this.__parents)

      if (index === -1) {
        this.__parents.push(parent)
      }
    }
  }
}

export class RecyclableSubscription extends Subscription {
  public recycle(): void {
    super.__class$$RecyclableSubscription$$unsafePrivateRecycleMethod$$()
  }
}
