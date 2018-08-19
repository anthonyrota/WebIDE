import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function nthWithDefaultValue<T>(
  index: number,
  defaultValue: T
): IOperator<T, T> {
  if (index < 0) {
    throw new Error('index cannot be less than zero')
  }
  return new NthWithDefaultValueOperator<T>(index, defaultValue)
}

class NthWithDefaultValueOperator<T> implements IOperator<T, T> {
  constructor(private index: number, private defaultValue: T) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new NthWithDefaultValueSubscriber(target, this.index, this.defaultValue)
    )
  }
}

class NthWithDefaultValueSubscriber<T> extends ValueTransmitter<T, T> {
  private index: number = 0

  constructor(
    target: ISubscriber<T>,
    private targetIndex: number,
    private defaultValue: T
  ) {
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

  public onComplete(): void {
    this.destination.next(this.defaultValue)
    this.destination.complete()
  }
}
