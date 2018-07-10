import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { SubscriptionTarget } from 'src/models/Stream/SubscriptionTarget'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function pairwise<T>(source: Stream<T>): Stream<[T, T]> {
  return source.lift(new PairwiseOperator<T>())
}

class PairwiseOperator<T> implements IOperator<T, [T, T]> {
  public call(
    target: SubscriptionTarget<[T, T]>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new PairwiseSubscriber<T>(target))
  }
}

class PairwiseSubscriber<T> extends ValueTransmitter<T, [T, T]> {
  private lastValue?: T
  private hasLastValue: boolean = false

  protected onNextValue(value: T): void {
    if (this.hasLastValue) {
      this.destination.next([this.lastValue!, value])
    } else {
      this.hasLastValue = true
    }

    this.lastValue = value
  }
}
