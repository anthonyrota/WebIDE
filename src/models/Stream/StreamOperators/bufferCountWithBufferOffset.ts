import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import {
  MonoTypeValueTransmitter,
  ValueTransmitter
} from 'src/models/Stream/ValueTransmitter'

export function bufferCountWithBufferOffset<T>(
  bufferSize: number,
  bufferOffset: number
): IConnectOperator<T, T[]> {
  return new BufferCountWithBufferOffsetOperator<T>(bufferSize, bufferOffset)
}

class BufferCountWithBufferOffsetOperator<T>
  implements IConnectOperator<T, T[]> {
  constructor(private bufferSize: number, private bufferOffset: number) {}

  public connect(
    target: MonoTypeValueTransmitter<T[]>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new BufferCountWithBufferOffsetSubscriber<T>(
        target,
        this.bufferSize,
        this.bufferOffset
      )
    )
  }
}

class BufferCountWithBufferOffsetSubscriber<T> extends ValueTransmitter<
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
