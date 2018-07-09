import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { StreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const bufferCount: {
  <T>(bufferSize: number): (source: Stream<T>) => Stream<T[]>
  <T>(bufferSize: number, source: Stream<T>): Stream<T[]>
} = curry2(
  <T>(bufferSize: number, source: Stream<T>): Stream<T[]> => {
    return source.lift(new BufferCountOperator(bufferSize))
  }
)

class BufferCountOperator<T> implements IOperator<T, T[]> {
  constructor(private bufferSize: number) {}

  public call(
    target: StreamSubscriptionTarget<T[]>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new BufferCountSubscriber<T>(target, this.bufferSize)
    )
  }
}

class BufferCountSubscriber<T> extends StreamValueTransmitter<T, T[]> {
  private buffer: T[]

  constructor(target: IStreamSubscriber<T[]>, private bufferSize: number) {
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

  protected onBeforeComplete(): void {
    if (this.buffer.length > 0) {
      this.destination.next(this.buffer)
    }
  }
}
