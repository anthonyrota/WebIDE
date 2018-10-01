import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { completeImmediately } from 'src/models/Stream/StreamOperators/completeImmediately'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function takeLast<T>(total: number): Operation<T, T> {
  if (total < 0) {
    throw new TypeError('total must be positive')
  }
  if (total === 0) {
    return completeImmediately()
  }
  return operateThroughValueTransmitter(
    target => new TakeLastValueTransmitter(target, total)
  )
}

class TakeLastValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  private lastValues: T[] = []

  constructor(target: ISubscriptionTarget<T>, private total: number) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.lastValues.length === this.total) {
      this.lastValues.shift()
    }
    this.lastValues.push(value)
  }

  protected onComplete(): void {
    for (let i = 0; i < this.lastValues.length; i++) {
      this.destination.next(this.lastValues[i])
    }
    this.destination.complete()
  }
}
