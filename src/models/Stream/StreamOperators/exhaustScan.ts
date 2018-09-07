import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function exhaustScan<T, U>(
  accumulate: (accumulatedValue: U, value: T, index: number) => Stream<U>,
  startingValue: U
): IOperator<T, U> {
  return new ExhaustScanOperator<T, U>(accumulate, startingValue)
}

class ExhaustScanOperator<T, U> implements IOperator<T, U> {
  constructor(
    private accumulate: (
      accumulatedValue: U,
      value: T,
      index: number
    ) => Stream<U>,
    private startingValue: U
  ) {}

  public connect(target: ISubscriber<U>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new ExhaustScanSubscriber<T, U>(
        target,
        this.accumulate,
        this.startingValue
      )
    )
  }
}

class ExhaustScanSubscriber<T, U> extends DoubleInputValueTransmitter<T, U, U> {
  private hasActiveStream: boolean = false
  private index: number = 0

  constructor(
    target: ISubscriber<U>,
    private accumulate: (
      accumulatedValue: U,
      value: T,
      index: number
    ) => Stream<U>,
    private accumulatedValue: U
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.hasActiveStream) {
      return
    }

    const { accumulate } = this
    const index = this.index++
    let resultStream: Stream<U>

    try {
      resultStream = accumulate(this.accumulatedValue, value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.hasActiveStream = true
    this.subscribeStreamToSelf(resultStream)
  }

  protected onComplete(): void {
    if (!this.hasActiveStream) {
      this.destination.complete()
    }
  }

  protected onOuterNextValue(value: U): void {
    this.accumulatedValue = value
    this.destination.next(value)
  }

  protected onOuterComplete(): void {
    this.hasActiveStream = false

    if (!this.isReceivingValues()) {
      this.destination.complete()
    }
  }
}
