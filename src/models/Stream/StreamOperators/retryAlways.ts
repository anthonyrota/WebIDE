import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { MonoTypeStreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'

export function retryAlways<T>(source: Stream<T>): Stream<T> {
  return source.lift(new RetryOperator<T>())
}

class RetryOperator<T> implements IOperator<T, T> {
  public call(
    target: StreamSubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new RetrySubscriber<T>(target, source))
  }
}

class RetrySubscriber<T> extends MonoTypeStreamValueTransmitter<T> {
  constructor(target: IStreamSubscriber<T>, private source: Stream<T>) {
    super(target)
  }

  public error(): void {
    if (this.isActive()) {
      this.recycle()
      this.source.subscribe(this)
    }
  }
}
