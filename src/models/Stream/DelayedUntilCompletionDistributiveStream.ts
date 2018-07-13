import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { DistributiveStream } from 'src/models/Stream/DistributiveStream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'

export class DelayedUntilCompletionDistributiveStream<
  T
> extends DistributiveStream<T> {
  private __value?: T
  private __hasValue: boolean = false

  public next(value: T): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (!this.isCompleted()) {
      this.__value = value
      this.__hasValue = true
    }
  }

  public complete(): void {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    if (!this.isCompleted()) {
      if (this.__hasValue) {
        super.next(this.__value!)
      }

      super.complete()
    }
  }

  public trySubscribe(target: SubscriptionTarget<T>): IDisposableLike {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.throwError()

    if (!this.isCompleted()) {
      return super.pushSubscriptionTarget(target)
    }

    if (this.__hasValue) {
      target.next(this.__value!)
    }

    target.complete()
  }
}
