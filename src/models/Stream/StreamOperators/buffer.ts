import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { curry2 } from 'src/utils/curry'

export const buffer: {
  <T>(shouldFlushBufferStream: Stream<any>): (source: Stream<T>) => Stream<T[]>
  <T>(shouldFlushBufferStream: Stream<any>, source: Stream<T>): Stream<T[]>
} = curry2(
  <T>(shouldFlushBufferStream: Stream<any>, source: Stream<T>): Stream<T[]> => {
    return source.lift(new BufferOperator<T>(shouldFlushBufferStream))
  }
)

class BufferOperator<T> implements IOperator<T, T[]> {
  constructor(private shouldFlushBufferStream: Stream<any>) {}

  public call(
    target: MonoTypeValueTransmitter<T[]>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new BufferSubscriber<T>(target, this.shouldFlushBufferStream)
    )
  }
}

class BufferSubscriber<T> extends DoubleInputValueTransmitter<T, T[], T> {
  private buffer: T[]

  constructor(target: ISubscriber<T[]>, shouldFlushBufferStream: Stream<any>) {
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

  protected onBeforeComplete(): void {
    if (this.buffer.length > 0) {
      this.destination.next(this.buffer)
    }
  }
}
