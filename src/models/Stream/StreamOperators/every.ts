import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function every<T>(
  predicate: (value: T, index: number) => boolean
): Operation<T, boolean> {
  return operateThroughValueTransmitter(
    target => new EveryValueTransmitter(target, predicate)
  )
}

class EveryValueTransmitter<T> extends ValueTransmitter<T, boolean> {
  private index: number = 0

  constructor(
    target: ISubscriptionTarget<boolean>,
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

    if (!isMatching) {
      this.destination.next(false)
      this.destination.complete()
    }
  }

  protected onComplete(): void {
    this.destination.next(true)
    this.destination.complete()
  }
}
