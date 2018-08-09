import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function distinctUntilChanged<T>(): IOperator<T, T> {
  return new DistinctUntilChangedOperator<T>()
}

class DistinctUntilChangedOperator<T> implements IOperator<T, T> {
  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
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
