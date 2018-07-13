import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { DistributiveStream } from 'src/models/Stream/DistributiveStream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'

export class DistributiveStreamWithLastValue<T> extends DistributiveStream<T> {
  private __value: T

  constructor(initialValue: T) {
    super()
    this.__value = initialValue
  }

  public next(value: T): void {
    this.__value = value
    super.next(value)
  }

  public trySubscribe(target: SubscriptionTarget<T>): IDisposableLike {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.throwError()

    if (this.isCompleted()) {
      target.complete()
    } else {
      target.next(this.__value)

      return this.pushSubscriptionTarget(target)
    }
  }

  public getValue(): T {
    if (!this.isActive()) {
      throw new AlreadyDisposedError()
    }

    this.throwError()

    return this.__value
  }
}
