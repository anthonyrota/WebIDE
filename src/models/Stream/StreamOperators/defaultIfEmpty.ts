import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function defaultIfEmpty<T>(defaultValue: T): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new DefaultIfEmptyValueTransmitter(target, defaultValue)
  )
}

class DefaultIfEmptyValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private isEmpty: boolean = true

  constructor(target: ISubscriptionTarget<T>, private defaultValue: T) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.isEmpty = false
    this.destination.next(value)
  }

  protected onComplete(): void {
    if (this.isEmpty) {
      this.destination.next(this.defaultValue)
    }
    this.destination.complete()
  }
}
