import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function scan<T>(
  accumulate: (accumulatedValue: T, value: T, index: number) => T
): IOperator<T, T> {
  return new ScanOperator<T>(accumulate)
}

class ScanOperator<T> implements IOperator<T, T> {
  constructor(
    private accumulate: (accumulatedValue: T, value: T, index: number) => T
  ) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(new ScanSubscriber<T>(target, this.accumulate))
  }
}

class ScanSubscriber<T> extends MonoTypeValueTransmitter<T> {
  private index: number = 0
  private hasAccumulatedValue: boolean = false
  private accumulatedValue: T | null = null

  constructor(
    target: ISubscriber<T>,
    private accumulate: (accumulatedValue: T, value: T, index: number) => T
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (!this.hasAccumulatedValue) {
      this.hasAccumulatedValue = true
      this.accumulatedValue = value
      this.destination.next(value)
      return
    }

    const { accumulate } = this
    const index = this.index++
    let newAccumulatedValue: T

    try {
      newAccumulatedValue = accumulate(this.accumulatedValue!, value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.accumulatedValue = newAccumulatedValue
    this.destination.next(this.accumulatedValue)
  }
}
