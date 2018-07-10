import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
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
    target: SubscriptionTarget<T>,
    source: Stream<any>
  ): IDisposableLike {
    return source.subscribe(new MapToSubscriber<T>(target, this.value))
  }
}

class MapToSubscriber<T> extends ValueTransmitter<any, T> {
  constructor(target: ISubscriber<T>, private value: T) {
    super(target)
  }

  protected onNextValue(): void {
    this.destination.next(this.value)
  }
}
