import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IConnectOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import {
  MonoTypeValueTransmitter,
  ValueTransmitter
} from 'src/models/Stream/ValueTransmitter'

export function bufferCount<T>(bufferSize: number): IConnectOperator<T, T[]> {
  return new BufferCountOperator<T>(bufferSize)
}

class BufferCountOperator<T> implements IConnectOperator<T, T[]> {
  constructor(private bufferSize: number) {}

  public connect(
    target: MonoTypeValueTransmitter<T[]>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new BufferCountSubscriber<T>(target, this.bufferSize)
    )
  }
}

class BufferCountSubscriber<T> extends ValueTransmitter<T, T[]> {
  private buffer: T[]

  constructor(target: ISubscriber<T[]>, private bufferSize: number) {
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
    super.onComplete()
  }
}
