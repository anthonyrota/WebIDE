import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import {
  MonoTypeValueTransmitter,
  ValueTransmitter
} from 'src/models/Stream/ValueTransmitter'
import { curry3 } from 'src/utils/curry'

export const bufferCountWithBufferOffset: {
  <T>(bufferSize: number): (
    bufferOffset: number
  ) => (source: Stream<T>) => Stream<T[]>
  <T>(bufferSize: number, bufferOffset: number): (
    source: Stream<T>
  ) => Stream<T[]>
  <T>(bufferSize: number, bufferOffset: number, source: Stream<T>): Stream<T[]>
} = curry3(
  <T>(
    bufferSize: number,
    bufferOffset: number,
    source: Stream<T>
  ): Stream<T[]> => {
    return source.lift(
      new BufferCountOperatorWithBufferOffset(bufferSize, bufferOffset)
    )
  }
)

class BufferCountOperatorWithBufferOffset<T> implements IOperator<T, T[]> {
  constructor(private bufferSize: number, private bufferOffset: number) {}

  public call(
    target: MonoTypeValueTransmitter<T[]>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new BufferCountSubscriberWithBufferOffset<T>(
        target,
        this.bufferSize,
        this.bufferOffset
      )
    )
  }
}

class BufferCountSubscriberWithBufferOffset<T> extends ValueTransmitter<
  T,
  T[]
> {
  private buffers: T[][] = []
  private valueIndex: number = 0

  constructor(
    target: ISubscriber<T[]>,
    private bufferSize: number,
    private bufferOffset: number
  ) {
    super(target)
  }

  protected onNextValue(value: T): void {
    this.valueIndex += 1

    if (this.valueIndex % this.bufferOffset === 0) {
      this.buffers.push([])
    }

    for (let i = 0; i < this.buffers.length; i++) {
      const buffer = this.buffers[i]

      buffer.push(value)
      if (buffer.length === this.bufferSize) {
        this.buffers.splice(i--, 1)
        this.destination.next(buffer)
      }
    }
  }

  protected onBeforeComplete(): void {
    for (let i = 0; i < this.buffers.length; i++) {
      if (this.buffers[i].length > 0) {
        this.destination.next(this.buffers[i])
      }
    }

    this.buffers = []
  }
}
