import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { IOperator } from 'src/models/Stream/IOperator'
import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { MonoTypeStreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'

export function distinct<T>(source: Stream<T>): Stream<T> {
  return source.lift(new DistinctOperator<T>())
}

export class DistinctOperator<T> implements IOperator<T, T> {
  public call(
    target: StreamSubscriptionTarget<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new DistinctSubscriber<T>(target))
  }
}

export class DistinctSubscriber<T> extends MonoTypeStreamValueTransmitter<T> {
  private values = new Set<T>()

  protected onNextValue(value: T): void {
    if (!this.values.has(value)) {
      this.values.add(value)
      this.destination.next(value)
    }
  }
}
