import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const tap: {
  <T>(subscriber: ISubscriber<T>): (source: Stream<T>) => Stream<T>
  <T>(subscriber: ISubscriber<T>, source: Stream<T>): Stream<T>
} = curry2(
  <T>(subscriber: ISubscriber<T>, source: Stream<T>): Stream<T> => {
    return source.lift(new TapOperator<T>(subscriber))
  }
)

class TapOperator<T> implements IOperator<T, T> {
  constructor(private subscriber: ISubscriber<T>) {}

  public call(
    target: SubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new TapSubscriber<T>(target, this.subscriber))
  }
}

class TapSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, private subscriber: ISubscriber<T>) {
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
