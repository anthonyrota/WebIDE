import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function endWith<T>(...values: T[]): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new EndWithValueTransmitter(target, values)
  )
}

class EndWithValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriptionTarget<T>, private values: T[]) {
    super(target)
  }

  protected onComplete(): void {
    for (let i = 0; i < this.values.length; i++) {
      this.destination.next(this.values[i])
    }
    this.destination.complete()
  }
}
