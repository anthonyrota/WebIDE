import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import {
  IDoubleStreamSubscriber,
  subscribeStreamToDoubleStreamSubscriber
} from 'src/models/Stream/DoubleStreamSubscriber'
import { IOperator } from 'src/models/Stream/IOperator'
import { IStreamSubscriber } from 'src/models/Stream/IStreamSubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { StreamSubscriptionTarget } from 'src/models/Stream/StreamSubscriptionTarget'
import { StreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'
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
    target: StreamSubscriptionTarget<T[]>,
    source: Stream<T>
  ): IDisposableLike {
    return source.subscribe(
      new BufferSubscriber<T>(target, this.shouldFlushBufferStream)
    )
  }
}

class BufferSubscriber<T> extends StreamValueTransmitter<T, T[]>
  implements IDoubleStreamSubscriber<T> {
  private buffer: T[]

  constructor(
    target: IStreamSubscriber<T[]>,
    shouldFlushBufferStream: Stream<any>
  ) {
    super(target)
    this.terminateDisposableWhenDisposed(
      subscribeStreamToDoubleStreamSubscriber(shouldFlushBufferStream, this)
    )
  }

  public onOuterNextValue(): void {
    const { buffer } = this

    this.buffer = []
    this.destination.next(buffer)
  }

  protected onNextValue(value: T): void {
    this.buffer.push(value)
  }

  protected onBeforeComplete(): void {
    if (this.buffer.length > 0) {
      this.destination.next(this.buffer)
    }
  }
}
