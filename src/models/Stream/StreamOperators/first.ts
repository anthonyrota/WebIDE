import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function first<T>(): IConnectOperator<T, T> {
  return new FirstOperator<T>()
}

class FirstOperator<T> implements IConnectOperator<T, T> {
  public connect(
    target: MonoTypeValueTransmitter<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(new FirstSubscriber<T>(target))
  }
}

class FirstSubscriber<T> extends MonoTypeValueTransmitter<T> {
  protected onNextValue(value: T): void {
    this.destination.next(value)
    this.destination.complete()
  }

  protected onComplete(): void {
    this.destination.error(new Error('[FirstOperator] No value was emitted'))
  }
}
