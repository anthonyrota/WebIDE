import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function nth<T>(index: number): IOperator<T, T> {
  if (index < 0) {
    throw new Error('index cannot be less than zero')
  }
  return new NthOperator<T>(index)
}

class NthOperator<T> implements IOperator<T, T> {
  constructor(private index: number) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new NthSubscriber(target, this.index))
  }
}

class NthSubscriber<T> extends ValueTransmitter<T, T> {
  private index: number = 0

  constructor(target: ISubscriber<T>, private targetIndex: number) {
    super(target)
  }

  public onNextValue(value: T): void {
    if (this.index === this.targetIndex) {
      this.destination.next(value)
      this.destination.complete()
    } else {
      this.index++
    }
  }
}
