import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function distinct<T>(source: Stream<T>): Stream<T> {
  return source.lift(new DistinctOperator<T>())
}

class DistinctOperator<T> implements IOperator<T, T> {
  public call(
    target: SubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new DistinctSubscriber<T>(target))
  }
}

class DistinctSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private values = new Set<T>()

  protected onNextValue(value: T): void {
    if (!this.values.has(value)) {
      this.values.add(value)
      this.destination.next(value)
    }
  }
}
