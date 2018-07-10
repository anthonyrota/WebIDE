import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function distinctUntilChanged<T>(source: Stream<T>): Stream<T> {
  return source.lift(new DistinctUntilChangedOperator<T>())
}

class DistinctUntilChangedOperator<T> implements IOperator<T, T> {
  public call(
    target: SubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new DistinctUntilChangedSubscriber<T>(target))
  }
}

class DistinctUntilChangedSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private lastValue?: T
  private hasLastValue: boolean = false

  protected onNextValue(value: T): void {
    if (!this.hasLastValue) {
      this.hasLastValue = true
      this.lastValue = value
      this.destination.next(value)
      return
    }

    if (this.lastValue !== value) {
      this.lastValue = value
      this.destination.next(value)
    }
  }
}
