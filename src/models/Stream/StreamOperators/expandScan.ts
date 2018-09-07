import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { MonoTypeDoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function expandScan<T>(
  accumulate: (accumulatedValue: T, value: T, index: number) => Stream<T>,
  startingValue: T
): IOperator<T, T> {
  return new ExpandScanOperator<T>(accumulate, startingValue)
}

class ExpandScanOperator<T> implements IOperator<T, T> {
  constructor(
    private accumulate: (
      accumulatedValue: T,
      value: T,
      index: number
    ) => Stream<T>,
    private startingValue: T
  ) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new ExpandScanSubscriber<T>(target, this.accumulate, this.startingValue)
    )
  }
}

class ExpandScanSubscriber<T> extends MonoTypeDoubleInputValueTransmitter<T> {
  private activeMergedStreamsCount: number = 0
  private index: number = 0

  constructor(
    target: ISubscriber<T>,
    private accumulate: (
      accumulatedValue: T,
      value: T,
      index: number
    ) => Stream<T>,
    private accumulatedValue: T
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { accumulate } = this
    const index = this.index++
    let resultStream: Stream<T>

    try {
      resultStream = accumulate(this.accumulatedValue, value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.activeMergedStreamsCount += 1
    this.subscribeStreamToSelf(resultStream)
  }

  protected onComplete(): void {
    if (this.activeMergedStreamsCount === 0) {
      this.destination.complete()
    }
  }

  protected onOuterNextValue(value: T): void {
    this.accumulatedValue = value
    this.onNextValue(value)
  }

  protected onOuterComplete(): void {
    this.activeMergedStreamsCount -= 1

    if (this.activeMergedStreamsCount === 0 && !this.isReceivingValues()) {
      this.destination.complete()
    }
  }
}
