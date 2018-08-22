import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function findValue<T>(value: T): IOperator<T, T> {
  return new FindValueOperator<T>(value)
}

class FindValueOperator<T> implements IOperator<T, T> {
  constructor(private targetValue: T) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new FindValueSubscriber(target, this.targetValue))
  }
}

class FindValueSubscriber<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, private targetValue: T) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.targetValue === value) {
      this.destination.next(value)
      this.destination.complete()
    }
  }
}
