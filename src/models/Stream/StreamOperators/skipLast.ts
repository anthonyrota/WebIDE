import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { copySource } from 'src/models/Stream/StreamOperators/copySource'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function skipLast<T>(total: number): Operation<T, T> {
  if (total < 0) {
    throw new TypeError('total must be positive')
  }
  if (total === 0) {
    return copySource()
  }
  return operateThroughValueTransmitter(
    target => new SkipLastValueTransmitter(target, total)
  )
}

class SkipLastValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private values: T[] = []

  constructor(target: ISubscriptionTarget<T>, private total: number) {
    super(target)
  }

  public onNextValue(value: T): void {
    this.values.push(value)

    if (this.values.length > this.total) {
      this.destination.next(this.values.shift()!)
    }
  }
}
