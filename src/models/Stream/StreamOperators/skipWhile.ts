import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function skipWhile<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new SkipWhileValueTransmitter(target, predicate)
  )
}

class SkipWhileValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private hasStoppedSkippingValues: boolean = false
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<T>,
    private predicate: (value: T, index: number) => boolean
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.hasStoppedSkippingValues) {
      this.destination.next(value)
      return
    }

    const { predicate } = this
    const index = this.index++
    let shouldContinueSkippingValues: boolean

    try {
      shouldContinueSkippingValues = predicate(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (!shouldContinueSkippingValues) {
      this.hasStoppedSkippingValues = true
      this.destination.next(value)
    }
  }
}
