import { Stream } from 'src/models/Stream/Stream'
import { IOperator } from 'src/models/Stream/IOperator'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLIke'
import { MonoTypeStreamDistributor } from 'src/models/Stream/StreamDistributor'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'

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

class RetrySubscriber<T> extends MonoTypeStreamDistributor<T> {
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
