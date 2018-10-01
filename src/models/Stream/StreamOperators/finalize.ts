import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function finalize<T>(onFinish: () => void): Operation<T, T> {
  return operateThroughValueTransmitter(
    target => new FinalizeValueTransmitter(target, onFinish)
  )
}

class FinalizeValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriptionTarget<T>, onFinish: () => unknown) {
    super(target)
    this.addOnDispose(onFinish)
  }
}
