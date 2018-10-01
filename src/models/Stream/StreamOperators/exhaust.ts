import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function exhaust<T>(): Operation<Stream<T>, T> {
  return operateThroughValueTransmitter(
    target => new ExhaustValueTransmitter(target)
  )
}

class ExhaustValueTransmitter<T> extends DoubleInputValueTransmitter<
  Stream<T>,
  T,
  T
> {
  private hasActiveStream: boolean = false

  protected onNextValue(stream: Stream<T>): void {
    if (!this.hasActiveStream) {
      this.hasActiveStream = true
      this.subscribeStreamToSelf(stream)
    }
  }

  protected onComplete(): void {
    if (!this.hasActiveStream) {
      this.destination.complete()
    }
  }

  protected onOuterComplete(): void {
    this.hasActiveStream = false
    if (!this.isReceivingValues()) {
      this.destination.complete()
    }
  }
}
