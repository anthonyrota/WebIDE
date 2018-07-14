import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { indexOf } from 'src/utils/indexOf'
import { removeOnce } from 'src/utils/removeOnce'

function createEmptySubscription(): Subscription {
  const subscription = new Subscription()
  subscription.dispose()
  return subscription
}

export class Subscription implements IConsciousDisposable {
  public static empty: Subscription = createEmptySubscription()
  private __isActive: boolean = true
  private __parents: Subscription[] = []
  private __disposables: IDisposable[] = []

  constructor(disposables?: IDisposable[]) {
    if (disposables) {
      for (let i = 0; i < disposables.length; i++) {
        this.__disposables[i] = disposables[i]
      }
    }
  }

  public static fromDisposable(disposable: IDisposable): Subscription {
    const subscription = new Subscription()
    subscription.__disposables.push(disposable)
    return subscription
  }

  public terminateDisposableWhenDisposed(
    disposable: IDisposable
  ): Subscription {
    if (!this.__isActive) {
      disposable.dispose()
      return isSubscription(disposable) ? disposable : Subscription.empty
    }

    if (disposable === Subscription.empty) {
      return Subscription.empty
    }

    if (disposable === this) {
      return this
    }

    let subscription: Subscription

    if (isSubscription(disposable)) {
      if (!disposable.isActive()) {
        return disposable
      }

      subscription = disposable

      if (indexOf(subscription, this.__disposables) !== -1) {
        return subscription
      }
    } else {
      subscription = Subscription.fromDisposable(disposable)
    }

    subscription.__addParent(this)
    this.__disposables.push(subscription)

    return subscription
  }

  public onDispose(dispose: () => void): Subscription {
    if (this.__isActive) {
      const subscription = Subscription.fromDisposable({ dispose })
      subscription.__addParent(this)
      this.__disposables.push(subscription)
      return subscription
    } else {
      dispose()
      return Subscription.empty
    }
  }

  public removeDisposable(disposable: IDisposable): void {
    if (this.__isActive) {
      removeOnce(disposable, this.__disposables)
    }
  }

  public dispose(): void {
    if (this.__isActive) {
      this.__disposeDisposables()
      this.__isActive = false
    }
  }

  public recycle(): void {
    this.__disposeDisposables()
    this.__isActive = true
  }

  public isActive(): boolean {
    return this.__isActive
  }

  private __disposeDisposables(): void {
    if (!this.__isActive) {
      return
    }

    const errors: any[] = []

    for (let i = 0; i < this.__parents.length; i++) {
      this.__parents[i].removeDisposable(this)
    }

    for (let i = 0; i < this.__disposables.length; i++) {
      try {
        this.__disposables[i].dispose()
      } catch (error) {
        errors.push(error)
      }
    }

    this.__parents.length = 0
    this.__disposables.length = 0

    if (errors.length > 0) {
      throw new Error(
        `The following errors occured when disposing the subscription: ${errors.join(
          ', '
        )}`
      )
    }
  }

  private __addParent(parent: Subscription): void {
    if (this.__isActive) {
      const index = indexOf(parent, this.__parents)

      if (index === -1) {
        this.__parents.push(parent)
      }
    }
  }
}

export function isSubscription(value: any): value is Subscription {
  return value instanceof Subscription
}
