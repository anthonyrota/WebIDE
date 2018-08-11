import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function scanWithInitialValue<T, U>(
  accumulate: (accumulatedValue: U, value: T, index: number) => U,
  initialValue: U
): IOperator<T, U> {
  return new ScanWithInitialValueOperator<T, U>(accumulate, initialValue)
}

class ScanWithInitialValueOperator<T, U> implements IOperator<T, U> {
  constructor(
    private accumulate: (accumulatedValue: U, value: T, index: number) => U,
    private initialValue: U
  ) {}

  public connect(target: ISubscriber<U>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new ScanWithInitialValueSubscriber<T, U>(
        target,
        this.accumulate,
        this.initialValue
      )
    )
  }
}

class ScanWithInitialValueSubscriber<T, U> extends ValueTransmitter<T, U> {
  private index: number = 0

  constructor(
    target: ISubscriber<U>,
    private accumulate: (accumulatedValue: U, value: T, index: number) => U,
    private accumulatedValue: U
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { accumulate } = this
    const index = this.index++
    let newAccumulatedValue: U

    try {
      newAccumulatedValue = accumulate(this.accumulatedValue, value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.accumulatedValue = newAccumulatedValue
    this.destination.next(this.accumulatedValue)
  }
}
