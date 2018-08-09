import { IDisposable } from 'src/models/Disposable/IDisposable'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { isDisposable } from 'src/models/Disposable/isDisposable'
import { freeze } from 'src/utils/freeze'
import { indexOf } from 'src/utils/indexOf'
import { isFunction } from 'src/utils/isFunction'
import { removeOnce } from 'src/utils/removeOnce'

export const isSubscriptionPropertyKey =
  '@@__SubscriptionClassEqualityCheckKey__@@'

export function isSubscription(candidate: any): candidate is ISubscription {
  return candidate != null && candidate[isSubscriptionPropertyKey] === true
}

export interface ISubscription {
  readonly [isSubscriptionPropertyKey]: true
  terminateDisposableWhenDisposed(disposable: IDisposable): ISubscription
  terminateDisposableLikeWhenDisposed(
    disposableLike: IDisposableLike
  ): ISubscription
  onDispose(dispose: () => void): ISubscription
  removeSubscription(subscription: ISubscription): void
  dispose(): void
  isActive(): boolean
  isDisposed(): boolean
}

export const emptySubscription: ISubscription = freeze({
  [isSubscriptionPropertyKey]: true as true,
  terminateDisposableWhenDisposed(disposable: IDisposable): ISubscription {
    disposable.dispose()
    return isSubscription(disposable) ? disposable : emptySubscription
  },
  terminateDisposableLikeWhenDisposed(
    disposableLike: IDisposableLike
  ): ISubscription {
    return isFunction(disposableLike)
      ? emptySubscription.onDispose(disposableLike)
      : isDisposable(disposableLike)
        ? emptySubscription.terminateDisposableWhenDisposed(disposableLike)
        : emptySubscription
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
  public readonly [isSubscriptionPropertyKey] = true

  private __isActive: boolean = true
  private __parents: ISubscription[] | null = null
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

  public terminateDisposableLikeWhenDisposed(
    disposableLike: IDisposableLike
  ): ISubscription {
    return isFunction(disposableLike)
      ? this.onDispose(disposableLike)
      : isDisposable(disposableLike)
        ? this.terminateDisposableWhenDisposed(disposableLike)
        : emptySubscription
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

  protected __class$$RecyclableSubscription$$unsafePrivateUnsubscribeAndRecycleRecycleMethod$$(): void {
    const parents = this.__parents
    this.__parents = null
    this.__isActive = false
    this.dispose()
    this.__isActive = true
    this.__parents = parents
  }

  private __disposeDisposables(): void {
    const errors: any[] = []

    if (this.__parents) {
      for (let i = 0; i < this.__parents.length; i++) {
        this.__parents[i].removeSubscription(this)
      }
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

    if (this.__parents) {
      this.__parents.length = 0
    }
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
      if (this.__parents) {
        const index = indexOf(parent, this.__parents)

        if (index === -1) {
          this.__parents.push(parent)
        }
      }
    }
  }
}

export class RecyclableSubscription extends Subscription {
  public unsubscribeAndRecycle(): void {
    super.__class$$RecyclableSubscription$$unsafePrivateUnsubscribeAndRecycleRecycleMethod$$()
  }
}
