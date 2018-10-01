import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function exhaustScan<T, U, A>(
  accumulate: (accumulatedValue: U | A, value: T, index: number) => Stream<U>,
  startingValue: U | A
): Operation<T, U> {
  return operateThroughValueTransmitter(
    target =>
      new ExhaustScanValueTransmitter<T, U, A>(
        target,
        accumulate,
        startingValue
      )
  )
}

class ExhaustScanValueTransmitter<T, U, A> extends DoubleInputValueTransmitter<
  T,
  U,
  U
> {
  private hasActiveStream: boolean = false
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<U>,
    private accumulate: (
      accumulatedValue: U | A,
      value: T,
      index: number
    ) => Stream<U>,
    private accumulatedValue: U | A
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
