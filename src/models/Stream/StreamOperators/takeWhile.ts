import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function takeWhile<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, T>
export function takeWhile<T, U extends T>(
  predicate: (value: T, index: number) => value is U
): Operation<T, U>
export function takeWhile<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new TakeWhileValueTransmitter(target, predicate)
  )
}

class TakeWhileValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<T>,
    private predicate: (value: T, index: number) => boolean
  ) {
    super(target)
  }

  public onNextValue(value: T): void {
    const { predicate } = this
    const index = this.index++
    let shouldDistributeValue: boolean

    try {
      shouldDistributeValue = predicate(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (shouldDistributeValue) {
      this.destination.next(value)
    } else {
      this.destination.complete()
    }
  }
}
