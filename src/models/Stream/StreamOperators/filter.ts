import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function filter<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, T>
export function filter<T, U extends T>(
  predicate: (value: T, index: number) => value is U
): Operation<T, U>
export function filter<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new FilterValueTransmitter(target, predicate)
  )
}

class FilterValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<T>,
    private predicate: (value: T, index: number) => boolean
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { predicate, destination } = this
    const index = this.index++
    let shouldDistributeValue: boolean

    try {
      shouldDistributeValue = predicate(value, index)
    } catch (error) {
      destination.error(error)
      return
    }

    if (shouldDistributeValue) {
      destination.next(value)
    }
  }
}
