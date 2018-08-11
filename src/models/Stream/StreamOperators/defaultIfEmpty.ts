import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function defaultIfEmpty<T>(defaultValue: T): IOperator<T, T> {
  return new DefaultIfEmptyOperator<T>(defaultValue)
}

class DefaultIfEmptyOperator<T> implements IOperator<T, T> {
  constructor(private defaultValue: T) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new DefaultIfEmptySubscriber<T>(target, this.defaultValue)
    )
  }
}

class DefaultIfEmptySubscriber<T> extends MonoTypeValueTransmitter<T> {
  private isEmpty: boolean = true

  constructor(target: ISubscriber<T>, private defaultValue: T) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.isEmpty = false
    this.destination.next(value)
  }

  protected onComplete(): void {
    if (this.isEmpty) {
      this.destination.next(this.defaultValue)
    }
    this.destination.complete()
  }
}
