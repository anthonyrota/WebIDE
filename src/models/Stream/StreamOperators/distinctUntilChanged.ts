import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function distinctUntilChanged<T>(): IConnectOperator<T, T> {
  return new DistinctUntilChangedOperator<T>()
}

class DistinctUntilChangedOperator<T> implements IConnectOperator<T, T> {
  public connect(
    target: MonoTypeValueTransmitter<T>,
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
