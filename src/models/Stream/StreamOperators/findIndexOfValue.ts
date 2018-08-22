import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function findValue<T>(value: T): IOperator<T, number> {
  return new FindValueOperator<T>(value)
}

class FindValueOperator<T> implements IOperator<T, number> {
  constructor(private targetValue: T) {}

  public connect(
    target: ISubscriber<number>,
    source: Stream<T>
  ): DisposableLike {
    return source.subscribe(new FindValueSubscriber(target, this.targetValue))
  }
}

class FindValueSubscriber<T> extends ValueTransmitter<T, number> {
  private index: number = 0

  constructor(target: ISubscriber<number>, private targetValue: T) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.targetValue === value) {
      this.destination.next(this.index)
      this.destination.complete()
    } else {
      this.index++
    }
  }
}
