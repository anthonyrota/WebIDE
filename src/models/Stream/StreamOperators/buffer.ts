import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function buffer<T>(
  shouldFlushBufferStream: Stream<unknown>
): Operation<T, T[]> {
  return operateThroughValueTransmitter(
    target => new BufferValueTransmitter(target, shouldFlushBufferStream)
  )
}

class BufferValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  T[],
  unknown
> {
  private buffer: T[] = []

  constructor(
    target: ISubscriptionTarget<T[]>,
    shouldFlushBufferStream: Stream<unknown>
  ) {
    super(target)
    this.subscribeStreamToSelf(shouldFlushBufferStream)
  }

  protected onNextValue(value: T): void {
    this.buffer.push(value)
  }

  protected onOuterNextValue(): void {
    const { buffer } = this

    this.buffer = []
    this.destination.next(buffer)
  }

  protected onOuterComplete(): void {
    if (this.buffer.length > 0) {
      this.destination.next(this.buffer)
    }
    this.destination.complete()
  }
}
