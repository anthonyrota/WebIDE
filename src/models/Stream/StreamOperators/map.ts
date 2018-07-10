import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const map: {
  <T, U>(transform: (value: T) => U): (source: Stream<T>) => Stream<U>
  <T, U>(transform: (value: T) => U, source: Stream<T>): Stream<U>
} = curry2(
  <T, U>(transform: (value: T) => U, source: Stream<T>): Stream<U> => {
    return source.lift(new MapOperator<T, U>(transform))
  }
)

class MapOperator<T, U> implements IOperator<T, U> {
  constructor(private transform: (value: T) => U) {}

  public call(
    target: SubscriptionTarget<U>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new MapSubscriber<T, U>(target, this.transform))
  }
}

class MapSubscriber<T, U> extends ValueTransmitter<T, U> {
  constructor(target: ISubscriber<U>, private transform: (value: T) => U) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { transform, destination } = this
    let transformedValue: U

    try {
      transformedValue = transform(value)
    } catch (error) {
      destination.error(error)
      return
    }

    destination.next(transformedValue)
  }
}
