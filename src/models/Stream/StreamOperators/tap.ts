import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { MonoTypeStreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const tap: {
  <T>(subscriber: IStreamSubscriber<T>): (source: Stream<T>) => Stream<T>
  <T>(subscriber: IStreamSubscriber<T>, source: Stream<T>): Stream<T>
} = curry2(
  <T>(subscriber: IStreamSubscriber<T>, source: Stream<T>): Stream<T> => {
    return source.lift(new TapOperator<T>(subscriber))
  }
)

class TapOperator<T> implements IOperator<T, T> {
  constructor(private subscriber: IStreamSubscriber<T>) {}

  public call(
    target: StreamSubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new TapSubscriber<T>(target, this.subscriber))
  }
}

class TapSubscriber<T> extends MonoTypeStreamValueTransmitter<T> {
  constructor(
    target: IStreamSubscriber<T>,
    private subscriber: IStreamSubscriber<T>
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    try {
      if (this.subscriber.next) {
        this.subscriber.next(value)
      }
    } catch (error) {
      this.destination.error(error)
      return
    }
    this.destination.next(value)
  }

  protected onError(error: T): void {
    try {
      if (this.subscriber.error) {
        this.subscriber.error(error)
      }
    } catch (tapError) {
      this.destination.error(tapError)
      return
    }
    this.destination.next(error)
  }

  protected onComplete(): void {
    try {
      if (this.subscriber.complete) {
        this.subscriber.complete()
      }
    } catch (tapError) {
      this.destination.error(tapError)
      return
    }
    this.destination.complete()
  }
}
