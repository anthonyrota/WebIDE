import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function throwIfEmpty<T>(getError: () => unknown): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new ThrowIfEmptyValueTransmitter(target, getError)
  )
}

class ThrowIfEmptyValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private hasValue: boolean = false

  constructor(target: ISubscriptionTarget<T>, private getError: () => unknown) {
    super(target)
  }

  public onNextValue(value: T): void {
    this.hasValue = true
    this.destination.next(value)
  }

  public complete(): void {
    if (this.hasValue) {
      this.destination.complete()
    } else {
      let computedError: unknown

      try {
        computedError = this.getError()
      } catch (error) {
        this.destination.error(error)
        return
      }

      this.destination.error(computedError)
    }
  }
}
