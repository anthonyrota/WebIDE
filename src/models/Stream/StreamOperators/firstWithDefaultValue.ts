import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function firstWithDefaultValue<T>(
  defaultValue: T
): IOperator<T, T> {
  return new FirstWithDefaultValueOperator<T>(defaultValue)
}

class FirstWithDefaultValueOperator<T> implements IOperator<T, T> {
  constructor(private defaultValue: T) {}

  public connect(
    target: ISubscriber<T>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new FirstWithDefaultValueSubscriber<T>(target, this.defaultValue)
    )
  }
}

class FirstWithDefaultValueSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, private defaultValue: T) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.destination.next(value)
    this.destination.complete()
  }

  protected onComplete(): void {
    this.destination.next(this.defaultValue)
    this.destination.complete()
  }
}
