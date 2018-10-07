import {
  DisposableLike,
  disposeDisposableLike
} from 'src/models/Disposable/DisposableLike'
import { always } from 'src/utils/always'
import { freeze } from 'src/utils/freeze'
import { isCallable } from 'src/utils/isCallable'
import { noop } from 'src/utils/noop'
import { removeOnce } from 'src/utils/removeOnce'
import { toArray } from 'src/utils/toArray'

export const isSubscriptionPropertyKey =
  '@@__SubscriptionClassEqualityCheckKey__@@'

export function isSubscription(candidate: any): candidate is ISubscription {
  return (
    candidate != null &&
    candidate[isSubscriptionPropertyKey] === true &&
    isCallable(candidate.addOnDispose) &&
    isCallable(candidate.removeOnDispose) &&
    isCallable(candidate.dispose) &&
    isCallable(candidate.isActive)
  )
}

export interface ISubscription {
  readonly [isSubscriptionPropertyKey]: true
  addOnDispose(disposableLike: DisposableLike): void
  removeOnDispose(disposableLike: DisposableLike): void
  dispose(): void
  isActive(): boolean
}

export const emptySubscription = freeze<ISubscription>({
  [isSubscriptionPropertyKey]: true,
  addOnDispose: disposeDisposableLike,
  removeOnDispose: noop,
  dispose: noop,
  isActive: always(false)
})

const recycleMethodPropertyName: string =
  '$$__private_recycleMethodPropertyName__$$'

export class Subscription implements ISubscription {
  public readonly [isSubscriptionPropertyKey] = true

  private __isActive: boolean = true
  private __childDisposableLikes: DisposableLike[]

  constructor(disposables?: Iterable<DisposableLike>) {
    this.__childDisposableLikes = disposables ? toArray(disposables) : []
  }

  public static from(disposable: DisposableLike): ISubscription {
    return new Subscription([disposable])
  }

  public addOnDispose(disposableLike: DisposableLike): void {
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

      const removeFromChildren = () => {
        this.removeOnDispose(removeFromDisposableLikesChildren)
        this.removeOnDispose(disposableLike)
      }

      const removeFromDisposableLikesChildren = () => {
        disposableLike.removeOnDispose(removeFromChildren)
      }

      disposableLike.addOnDispose(removeFromChildren)
      this.__childDisposableLikes.push(removeFromDisposableLikesChildren)
    }

    this.__childDisposableLikes.push(disposableLike)
  }

  public removeOnDispose(disposableLike: DisposableLike): void {
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
