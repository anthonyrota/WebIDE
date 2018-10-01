import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { completeImmediately } from 'src/models/Stream/StreamOperators/completeImmediately'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function take<T>(total: number): Operation<T, T> {
  if (total < 0) {
    throw new TypeError('total must be positive')
  }
  if (total === 0) {
    return completeImmediately()
  }
  return operateThroughValueTransmitter(
    target => new TakeValueTransmitter(target, total)
  )
}

class TakeValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private count: number = 0

  constructor(target: ISubscriptionTarget<T>, private total: number) {
    super(target)
  }

  public onNextValue(value: T): void {
    this.count++

    if (this.count <= this.total) {
      this.destination.next(value)

      if (this.count === this.total) {
        this.destination.complete()
      }
    }
  }
}
