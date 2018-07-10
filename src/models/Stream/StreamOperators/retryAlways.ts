import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function retryAlways<T>(source: Stream<T>): Stream<T> {
  return source.lift(new RetryOperator<T>())
}

class RetryOperator<T> implements IOperator<T, T> {
  public call(
    target: SubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new RetrySubscriber<T>(target, source))
  }
}

class RetrySubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, private source: Stream<T>) {
    super(target)
  }

  public error(): void {
    if (this.isActive()) {
      this.recycle()
      this.source.subscribe(this)
    }
  }
}
