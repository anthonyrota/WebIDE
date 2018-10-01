import { MonoTypeDoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function expandMapConcurrent<T>(
  convertValueToStream: (value: T, index: number) => Stream<T>,
  concurrency: number
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target =>
      new ExpandMapConcurrentValueTransmitter(
        target,
        convertValueToStream,
        concurrency
      )
  )
}

class ExpandMapConcurrentValueTransmitter<
  T
> extends MonoTypeDoubleInputValueTransmitter<T> {
  private valuesToProcess: T[] = []
  private activeMergedStreamsCount: number = 0
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<T>,
    private convertValueToStream: (value: T, index: number) => Stream<T>,
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

  protected onOuterNextValue(value: T): void {
    this.onNextValue(value)
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
    this.destination.next(value)

    const { convertValueToStream } = this
    const index = this.index++
    let resultStream: Stream<T>

    try {
      resultStream = convertValueToStream(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.activeMergedStreamsCount += 1
    this.subscribeStreamToSelf(resultStream)
  }
}
