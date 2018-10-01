import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function findValueAndIndex<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, IValueAndIndexHolder<T>> {
  return operateThroughValueTransmitter(
    target => new FindValueAndIndexValueTransmitter(target, predicate)
  )
}

export interface IValueAndIndexHolder<T> {
  value: T
  index: number
}

class FindValueAndIndexValueTransmitter<T> extends ValueTransmitter<
  T,
  IValueAndIndexHolder<T>
> {
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<IValueAndIndexHolder<T>>,
    private predicate: (value: T, index: number) => boolean
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { predicate } = this
    const index = this.index++
    let isMatching: boolean

    try {
      isMatching = predicate(value, index)
    } catch (error) {
      this.destination.error(error)
      return
    }

    if (isMatching) {
      this.destination.next({ value, index })
      this.destination.complete()
    }
  }
}
