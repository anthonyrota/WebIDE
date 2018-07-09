import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { StreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const mapTo: {
  <T>(value: T): (source: Stream<any>) => Stream<T>
  <T>(value: T, source: Stream<any>): Stream<T>
} = curry2(
  <T>(value: T, source: Stream<any>): Stream<T> => {
    return source.lift(new MapToOperator<T>(value))
  }
)

class MapToOperator<T> implements IOperator<any, T> {
  constructor(private value: T) {}

  public call(
    target: StreamSubscriptionTarget<T>,
    source: Stream<any>
  ): IDisposableLike {
    return source.subscribe(new MapToSubscriber<T>(target, this.value))
  }
}

class MapToSubscriber<T> extends StreamValueTransmitter<any, T> {
  constructor(target: IStreamSubscriber<T>, private value: T) {
    super(target)
  }

  protected onNextValue(): void {
    this.destination.next(this.value)
  }
}
