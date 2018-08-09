import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function pairwise<T>(source: Stream<T>): IOperator<T, [T, T]> {
  return new PairwiseOperator<T>()
}

class PairwiseOperator<T> implements IOperator<T, [T, T]> {
  public connect(
    target: ISubscriber<[T, T]>,
    source: Stream<T>
  ): DisposableLike {
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
