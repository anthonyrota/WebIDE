import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
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
    target: SubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new FilterSubscriber<T>(target, this.predicate))
  }
}

class FilterSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(
    target: ISubscriber<T>,
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
