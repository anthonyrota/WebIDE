import { MutableMaybe } from 'src/models/Maybe/MutableMaybe'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function pairwise<T>(): Operation<T, [T, T]> {
  return operateThroughValueTransmitter(
    target => new PairwiseValueTransmitter(target)
  )
}

class PairwiseValueTransmitter<T> extends ValueTransmitter<T, [T, T]> {
  private lastValue: MutableMaybe<T> = MutableMaybe.none()

  protected onNextValue(newValue: T): void {
    this.lastValue.withValue(lastValue => {
      this.destination.next([lastValue, newValue])
    })
    this.lastValue.setAs(newValue)
  }
}
