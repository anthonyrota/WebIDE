import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { MonoTypeStreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const retry: {
  <T>(count: number): (source: Stream<T>) => Stream<T>
  <T>(count: number, source: Stream<T>): Stream<T>
} = curry2(
  <T>(count: number, source: Stream<T>): Stream<T> => {
    if (count < 0) {
      throw new TypeError('count must be positive')
    }
    return source.lift(new RetryOperator<T>(count))
  }
)

class RetryOperator<T> implements IOperator<T, T> {
  constructor(private count: number) {}

  public call(
    target: StreamSubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new RetrySubscriber<T>(target, this.count, source))
  }
}

class RetrySubscriber<T> extends MonoTypeStreamValueTransmitter<T> {
  constructor(
    target: IStreamSubscriber<T>,
    private count: number,
    private source: Stream<T>
  ) {
    super(target)
  }

  public error(error: any): void {
    if (this.isActive()) {
      if (this.count === 0) {
        super.error(error)
        return
      }

      this.recycle()
      this.source.subscribe(this)
    }
  }
}
