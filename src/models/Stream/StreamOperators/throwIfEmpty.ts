import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function throwIfEmpty<T>(error: unknown): IOperator<T, T> {
  return new ThrowIfEmptyOperator<T>(error)
}

class ThrowIfEmptyOperator<T> implements IOperator<T, T> {
  constructor(private error: unknown) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): IDisposableLike {
    return source.subscribe(new ThrowIfEmptySubscriber<T>(target, this.error))
  }
}

class ThrowIfEmptySubscriber<T> extends MonoTypeValueTransmitter<T> {
  private hasValue: boolean = false

  constructor(subscriber: ISubscriber<T>, private errorIfEmpty: unknown) {
    super(subscriber)
  }

  public onNextValue(value: T): void {
    this.hasValue = true
    this.destination.next(value)
  }

  public complete(): void {
    if (this.hasValue) {
      this.destination.complete()
    } else {
      this.destination.error(this.errorIfEmpty)
    }
  }
}
