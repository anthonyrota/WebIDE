import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import {
  MonoTypeValueTransmitter,
  ValueTransmitter
} from 'src/models/Stream/ValueTransmitter'

export function pairwise<T>(source: Stream<T>): IConnectOperator<T, [T, T]> {
  return new PairwiseOperator<T>()
}

class PairwiseOperator<T> implements IConnectOperator<T, [T, T]> {
  public connect(
    target: MonoTypeValueTransmitter<[T, T]>,
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
