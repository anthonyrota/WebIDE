import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function bufferCount<T>(bufferSize: number): Operation<T, T[]> {
  return operateThroughValueTransmitter(
    target => new BufferCountValueTransmitter(target, bufferSize)
  )
}

class BufferCountValueTransmitter<T> extends ValueTransmitter<T, T[]> {
  private buffer: T[] = []

  constructor(target: ISubscriptionTarget<T[]>, private bufferSize: number) {
    super(target)
  }

  protected onNextValue(value: T): void {
    const { buffer } = this

    buffer.push(value)

    if (buffer.length === this.bufferSize) {
      this.buffer = []
      this.destination.next(buffer)
    }
  }

  protected onComplete(): void {
    if (this.buffer.length > 0) {
      this.destination.next(this.buffer)
    }
    this.destination.complete()
  }
}
