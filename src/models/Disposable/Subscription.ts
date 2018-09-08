import {
  DisposableLike,
  disposeDisposableLike
} from 'src/models/Disposable/DisposableLike'
import { isDisposable } from 'src/models/Disposable/isDisposable'
import { freeze } from 'src/utils/freeze'
import { isFunction } from 'src/utils/isFunction'
import { removeOnce } from 'src/utils/removeOnce'

export const isSubscriptionPropertyKey =
  '@@__SubscriptionClassEqualityCheckKey__@@'

export function isSubscription(candidate: any): candidate is ISubscription {
  return (
    candidate != null &&
    candidate[isSubscriptionPropertyKey] === true &&
    isFunction(candidate.add) &&
    isFunction(candidate.remove) &&
    isFunction(candidate.dispose) &&
    isFunction(candidate.isActive)
  )
}

export interface ISubscription {
  readonly [isSubscriptionPropertyKey]: true
  add(disposableLike: DisposableLike): void
  remove(disposableLike: DisposableLike): void
  dispose(): void
  isActive(): boolean
}

export interface IImmutableSubscriptionView {
  add(disposableLike: DisposableLike): void
  remove(disposableLike: DisposableLike): void
  isActive(): boolean
}

export const emptySubscription: ISubscription = freeze({
  [isSubscriptionPropertyKey]: true as true,
  add(disposableLike: DisposableLike): void {
    if (isFunction(disposableLike)) {
      disposableLike()
    } else if (isDisposable(disposableLike)) {
      disposableLike.dispose()
    }
  },
  remove(disposableLike: DisposableLike): void {},
  dispose(): void {},
  isActive(): boolean {
    return false
  }
})

const recycleMethodPropertyName: string =
  '$$__private_recycleMethodPropertyName__$$'

export class Subscription implements ISubscription {
  public readonly [isSubscriptionPropertyKey] = true

  private __isActive: boolean = true
  private __childDisposableLikes: DisposableLike[]

  constructor(disposables: DisposableLike[] = []) {
    this.__childDisposableLikes = disposables
  }

  public add(disposableLike: DisposableLike): void {
    if (!this.__isActive) {
      disposeDisposableLike(disposableLike)
      return
    }

    if (disposableLike === emptySubscription || disposableLike === this) {
      return
    }

    if (isSubscription(disposableLike)) {
      if (!disposableLike.isActive()) {
        return
      }

      disposableLike.add(() => {
        this.remove(disposableLike)
      })
    }

    this.__childDisposableLikes.push(disposableLike)
  }

  public remove(disposableLike: DisposableLike): void {
    if (this.__isActive) {
      removeOnce(this.__childDisposableLikes, disposableLike)
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

  public [recycleMethodPropertyName](): void {
    this.dispose()
    this.__isActive = true
  }

  private __disposeDisposables(): void {
    this.__childDisposableLikes.forEach(disposeDisposableLike)
    this.__childDisposableLikes.length = 0
  }
}

export class RecyclableSubscription extends Subscription {
  public disposeAndRecycle(): void {
    super[recycleMethodPropertyName]()
  }
}
