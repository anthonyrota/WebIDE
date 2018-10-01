import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function scanWithInitialValue<T, U>(
  accumulate: (accumulatedValue: U, value: T, index: number) => U,
  initialValue: U
): Operation<T, U> {
  return operateThroughValueTransmitter(
    target =>
      new ScanWithInitialValueValueTransmitter(target, accumulate, initialValue)
  )
}

class ScanWithInitialValueValueTransmitter<T, U> extends ValueTransmitter<
  T,
  U
> {
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<U>,
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
