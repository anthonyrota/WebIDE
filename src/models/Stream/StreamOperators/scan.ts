import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function scan<T>(
  accumulate: (accumulatedValue: T, value: T, index: number) => T
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new ScanValueTransmitter(target, accumulate)
  )
}

class ScanValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private index: number = 0
  private hasAccumulatedValue: boolean = false
  private accumulatedValue: T | null = null

  constructor(
    target: ISubscriptionTarget<T>,
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
