import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function scanWithInitialValue<T, U, I = U>(
  accumulate: (accumulatedValue: U | I, value: T, index: number) => U,
  initialValue: U | I
): Operation<T, U> {
  return operateThroughValueTransmitter(
    target =>
      new ScanWithInitialValueValueTransmitter<T, U, I>(
        target,
        accumulate,
        initialValue
      )
  )
}

class ScanWithInitialValueValueTransmitter<T, U, I> extends ValueTransmitter<
  T,
  U
> {
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<U>,
    private accumulate: (accumulatedValue: U | I, value: T, index: number) => U,
    private accumulatedValue: U | I
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
