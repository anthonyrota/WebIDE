import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function bufferCountWithOverlapOffset<T>(
  bufferSize: number,
  bufferOffset: number
): Operation<T, T[]> {
  return operateThroughValueTransmitter(
    target =>
      new BufferCountWithOverlapOffsetValueTransmitter(
        target,
        bufferSize,
        bufferOffset
      )
  )
}

class BufferCountWithOverlapOffsetValueTransmitter<T> extends ValueTransmitter<
  T,
  T[]
> {
  private buffers: T[][] = []
  private valueIndex: number = 0

  constructor(
    target: ISubscriptionTarget<T[]>,
    private bufferSize: number,
    private bufferOffset: number
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    if (this.valueIndex % this.bufferOffset === 0) {
      this.buffers.push([])
    }

    this.valueIndex += 1

    for (let i = 0; i < this.buffers.length; i++) {
      const buffer = this.buffers[i]

      buffer.push(value)
      if (buffer.length === this.bufferSize) {
        this.buffers.splice(i--, 1)
        this.destination.next(buffer)
      }
    }
  }

  protected onComplete(): void {
    for (let i = 0; i < this.buffers.length; i++) {
      if (this.buffers[i].length > 0) {
        this.destination.next(this.buffers[i])
      }
    }

    this.buffers = []
    this.destination.complete()
  }
}
