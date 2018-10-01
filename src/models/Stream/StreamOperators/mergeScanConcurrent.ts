import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function mergeScanConcurrent<T, U, A>(
  accumulate: (accumulatedValue: U | A, value: T, index: number) => Stream<U>,
  startingValue: U | A,
  concurrency: number
): Operation<T, U> {
  return operateThroughValueTransmitter(
    target =>
      new MergeScanConcurrentValueTransmitter<T, U, A>(
        target,
        accumulate,
        startingValue,
        concurrency
      )
  )
}

class MergeScanConcurrentValueTransmitter<
  T,
  U,
  A
> extends DoubleInputValueTransmitter<T, U, U> {
  private valuesToProcess: T[] = []
  private activeMergedStreamsCount: number = 0
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<U>,
    private accumulate: (
      accumulatedValue: U | A,
      value: T,
      index: number
    ) => Stream<U>,
    private accumulatedValue: U | A,
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
