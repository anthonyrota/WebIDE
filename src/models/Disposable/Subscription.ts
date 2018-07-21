import { IDisposable } from 'src/models/Disposable/IDisposable'
import { freeze } from 'src/utils/freeze'
import { indexOf } from 'src/utils/indexOf'
import { removeOnce } from 'src/utils/removeOnce'

export const $$subscription = '@@__SubscriptionClassEqualityCheckKey__@@'

export function isSubscription(candidate: any): candidate is ISubscription {
  return candidate && candidate[$$subscription] === true
}

export interface ISubscription {
  readonly [$$subscription]: true
  terminateDisposableWhenDisposed(disposable: IDisposable): ISubscription
  onDispose(dispose: () => void): ISubscription
  removeSubscription(subscription: ISubscription): void
  dispose(): void
  isActive(): boolean
  isDisposed(): boolean
}

export const emptySubscription: ISubscription = freeze({
  [$$subscription]: true as true,
  terminateDisposableWhenDisposed(disposable: IDisposable): ISubscription {
    disposable.dispose()
    return isSubscription(disposable) ? disposable : emptySubscription
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
  public readonly [$$subscription] = true

  private __isActive: boolean = true
  private __parents: ISubscription[] = []
  private __childDisposables: IDisposable[] = []
  private __$$internalDisposable__willTerminateWhenDisposed__$$?: IDisposable

  public static fromDisposable(disposable: IDisposable): ISubscription {
    if (isSubscription(disposable)) {
      return disposable
    }
    const subscription = new Subscription()
    subscription.__$$internalDisposable__willTerminateWhenDisposed__$$ = disposable
    return subscription
  }

  public terminateDisposableWhenDisposed(
    disposable: IDisposable
  ): ISubscription {
    if (!this.__isActive) {
      disposable.dispose()
      return isSubscription(disposable) ? disposable : emptySubscription
    }

    if (disposable === emptySubscription) {
      return emptySubscription
    }

    if (disposable === this) {
      return this
    }

    if (isSubscription(disposable) && !disposable.isActive()) {
      return disposable
    }

    let subscription: Subscription

    if (disposable instanceof Subscription) {
      subscription = disposable

      if (indexOf(subscription, this.__childDisposables) !== -1) {
        return subscription
      }
    } else {
      subscription = new Subscription()
      subscription.__$$internalDisposable__willTerminateWhenDisposed__$$ = disposable
    }

    subscription.__addParent(this)
    this.__childDisposables.push(subscription)

    return subscription
  }

  public onDispose(dispose: () => void): ISubscription {
    if (this.__isActive) {
      const subscription = new Subscription()
      subscription.__$$internalDisposable__willTerminateWhenDisposed__$$ = {
        dispose
      }
      subscription.__addParent(this)
      this.__childDisposables.push(subscription)
      return subscription
    } else {
      dispose()
      return emptySubscription
    }
  }

  public removeSubscription(subscription: ISubscription): void {
    if (this.__isActive) {
      removeOnce(subscription, this.__childDisposables)
    }
  }

  public dispose(): void {
    if (this.__isActive) {
      this.__isActive = false
      this.__disposeDisposables()
    }
  }

  public isActive(): boolean {
    return this.__isActive
  }

  public isDisposed(): boolean {
    return !this.__isActive
  }

  protected __class$$RecyclableSubscription$$unsafePrivateRecycleMethod$$(): void {
    if (!this.__isActive) {
      this.__disposeDisposables()
      this.__isActive = true
    }
  }

  private __disposeDisposables(): void {
    if (!this.__isActive) {
      return
    }

    const errors: any[] = []

    for (let i = 0; i < this.__parents.length; i++) {
      this.__parents[i].removeSubscription(this)
    }

    if (this.__$$internalDisposable__willTerminateWhenDisposed__$$) {
      try {
        this.__$$internalDisposable__willTerminateWhenDisposed__$$.dispose()
      } catch (error) {
        errors.push(error)
      }
    }

    for (let i = 0; i < this.__childDisposables.length; i++) {
      try {
        this.__childDisposables[i].dispose()
      } catch (error) {
        errors.push(error)
      }
    }

    this.__parents.length = 0
    this.__childDisposables.length = 0

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
