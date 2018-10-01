import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function map<T, U>(
  transform: (value: T, index: number) => U
): Operation<T, U> {
  return operateThroughValueTransmitter(
    target => new MapValueTransmitter(target, transform)
  )
}

class MapValueTransmitter<T, U> extends ValueTransmitter<T, U> {
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<U>,
    private transform: (value: T, index: number) => U
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { transform, destination } = this
    const index = this.index++
    let transformedValue: U

    try {
      transformedValue = transform(value, index)
    } catch (error) {
      destination.error(error)
      return
    }

    destination.next(transformedValue)
  }
}
