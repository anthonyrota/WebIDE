import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { operateThroughValueTransmitter, Operation } from '../Operation'
import { ValueTransmitter } from '../ValueTransmitter'

export function includes<T>(targetValue: T): Operation<T, boolean> {
  return operateThroughValueTransmitter(
    target => new IncludesValueTransmitter(target, targetValue)
  )
}

class IncludesValueTransmitter<T> extends ValueTransmitter<T, boolean> {
  constructor(target: ISubscriptionTarget<boolean>, private targetValue: T) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.targetValue === value) {
      this.destination.next(true)
      this.destination.complete()
    }
  }

  protected onComplete(): void {
    this.destination.next(false)
  }
}
