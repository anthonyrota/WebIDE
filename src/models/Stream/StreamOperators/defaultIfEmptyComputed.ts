import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function defaultIfEmptyComputed<T>(
  getDefaultValue: () => T
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target =>
      new DefaultIfEmptyComputedValueTransmitter(target, getDefaultValue)
  )
}

class DefaultIfEmptyComputedValueTransmitter<
  T
> extends MonoTypeValueTransmitter<T> {
  private isEmpty: boolean = true

  constructor(target: ISubscriptionTarget<T>, private getDefaultValue: () => T) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.isEmpty = false
    this.destination.next(value)
  }

  protected onComplete(): void {
    if (this.isEmpty) {
      const { getDefaultValue } = this
      let defaultValue: T

      try {
        defaultValue = getDefaultValue()
      } catch (error) {
        this.destination.error(error)
        return
      }

      this.destination.next(defaultValue)
    }

    this.destination.complete()
  }
}
