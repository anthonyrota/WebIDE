import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function mergeScanConcurrent<T, U>(
  accumulate: (accumulatedValue: U, value: T, index: number) => Stream<U>,
  startingValue: U,
  concurrency: number
): IOperator<T, U> {
  return new MergeScanConcurrentOperator<T, U>(
    accumulate,
    startingValue,
    concurrency
  )
}

class MergeScanConcurrentOperator<T, U> implements IOperator<T, U> {
  constructor(
    private accumulate: (
      accumulatedValue: U,
      value: T,
      index: number
    ) => Stream<U>,
    private startingValue: U,
    private concurrency: number
  ) {}

  public connect(target: ISubscriber<U>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new MergeScanConcurrentSubscriber<T, U>(
        target,
        this.accumulate,
        this.startingValue,
        this.concurrency
      )
    )
  }
}

class MergeScanConcurrentSubscriber<T, U> extends DoubleInputValueTransmitter<
  T,
  U,
  U
> {
  private valuesToProcess: T[] = []
  private activeMergedStreamsCount: number = 0
  private index: number = 0

  constructor(
    target: ISubscriber<U>,
    private accumulate: (
      accumulatedValue: U,
      value: T,
      index: number
    ) => Stream<U>,
    private accumulatedValue: U,
    private concurrency: number
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.activeMergedStreamsCount < this.concurrency) {
      this.processValue(value)
    } else {
      this.valuesToProcess.push(value)
    }
  }

  protected onComplete(): void {
    if (
      this.activeMergedStreamsCount === 0 &&
      this.valuesToProcess.length === 0
    ) {
      this.destination.complete()
    }
  }

  protected onOuterNextValue(value: U): void {
    this.accumulatedValue = value
    this.destination.next(value)
  }

  protected onOuterComplete(): void {
    this.activeMergedStreamsCount -= 1

    if (this.valuesToProcess.length > 0) {
      this.processValue(this.valuesToProcess.shift()!)
    } else if (
      this.activeMergedStreamsCount === 0 &&
      !this.isReceivingValues()
    ) {
      this.destination.complete()
    }
  }

  private processValue(value: T): void {
    const { accumulate } = this
    const index = this.index++
    let resultStream: Stream<U>

    try {
      resultStream = accumulate(this.accumulatedValue, value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.activeMergedStreamsCount += 1
    this.subscribeStreamToSelf(resultStream)
  }
}
