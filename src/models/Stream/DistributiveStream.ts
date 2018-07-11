import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  ImmutableMutableMaybeView,
  MutableMaybe
} from 'src/models/Maybe/MutableMaybe'
import { IRequiredSubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { removeOnce } from 'src/utils/removeOnce'

export class DistributiveStream<T> extends Stream<T>
  implements IConsciousDisposable, IRequiredSubscriber<T> {
  private __mutableThrownError: MutableMaybe<any> = MutableMaybe.none<any>()
  private __subsciptionTargets: Array<SubscriptionTarget<T>>
  private __isDisposed: boolean = true
  private __isStopped: boolean = false

  public next(value: T): void {
    if (this.__isDisposed) {
      throw new AlreadyDisposedError()
    }

    if (!this.__isStopped) {
      const subscribers = this.__subsciptionTargets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].next(value)
      }
    }
  }

  public error(error: any): void {
    if (this.__isDisposed) {
      throw new AlreadyDisposedError()
    }

    if (!this.__isStopped) {
      this.__mutableThrownError.setValue(error)
      this.__isStopped = true

      const subscribers = this.__subsciptionTargets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].error(error)
      }

      this.__subsciptionTargets.length = 0
    }
  }

  public complete(): void {
    if (this.__isDisposed) {
      throw new AlreadyDisposedError()
    }

    if (!this.__isStopped) {
      this.__isStopped = true

      const subscribers = this.__subsciptionTargets.slice()

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].complete()
      }

      this.__subsciptionTargets.length = 0
    }
  }

  public dispose(): void {
    this.__isStopped = true
    this.__isDisposed = true
    this.__subsciptionTargets.length = 0
  }

  public isActive(): boolean {
    return !this.__isDisposed
  }

  public isStopped(): boolean {
    return this.__isStopped
  }

  protected getThrownError(): ImmutableMutableMaybeView<any> {
    return this.__mutableThrownError.getImmutableView()
  }

  protected trySubscribe(target: SubscriptionTarget<T>): IDisposableLike {
    if (this.__isDisposed) {
      throw new AlreadyDisposedError()
    }

    this.__mutableThrownError.throwValue()

    if (this.__isStopped) {
      target.complete()
    } else {
      this.__subsciptionTargets.push(target)

      return new SubjectSubscriptionDisposable(
        this,
        this.__subsciptionTargets,
        target
      )
    }
  }
}

class SubjectSubscriptionDisposable<T> {
  constructor(
    private distributiveStream: DistributiveStream<T>,
    private distributiveStreamSubscriptionTargets: Array<SubscriptionTarget<T>>,
    private target: SubscriptionTarget<T>
  ) {}

  public dispose() {
    if (!this.distributiveStream.isStopped()) {
      removeOnce(this.target, this.distributiveStreamSubscriptionTargets)
    }
  }
}
