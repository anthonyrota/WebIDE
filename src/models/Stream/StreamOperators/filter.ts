import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeStreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { curry2 } from 'src/utils/curry'

export const filter: {
  <T>(predicate: (value: T) => boolean): (source: Stream<T>) => Stream<T>
  <T>(predicate: (value: T) => boolean, source: Stream<T>): Stream<T>
} = curry2(
  <T>(predicate: (value: T) => boolean, source: Stream<T>): Stream<T> => {
    return source.lift(new FilterOperator<T>(predicate))
  }
)

class FilterOperator<T> implements IOperator<T, T> {
  constructor(private predicate: (value: T) => boolean) {}

  public call(
    target: StreamSubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new FilterSubscriber<T>(target, this.predicate))
  }
}

class FilterSubscriber<T> extends MonoTypeStreamValueTransmitter<T> {
  constructor(
    target: IStreamSubscriber<T>,
    private predicate: (value: T) => boolean
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { predicate, destination } = this
    let distributeValue: boolean

    try {
      distributeValue = predicate(value)
    } catch (error) {
      destination.error(error)
      return
    }

    if (distributeValue) {
      destination.next(value)
    }
  }
}
