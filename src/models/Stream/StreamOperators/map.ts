import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { StreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
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
    target: StreamSubscriptionTarget<U>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new MapSubscriber<T, U>(target, this.transform))
  }
}

class MapSubscriber<T, U> extends StreamValueTransmitter<T, U> {
  constructor(
    target: IStreamSubscriber<U>,
    private transform: (value: T) => U
  ) {
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
