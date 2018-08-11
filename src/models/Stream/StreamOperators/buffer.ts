import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function buffer<T>(
  shouldFlushBufferStream: Stream<unknown>
): IOperator<T, T[]> {
  return new BufferOperator<T>(shouldFlushBufferStream)
}

class BufferOperator<T> implements IOperator<T, T[]> {
  constructor(private shouldFlushBufferStream: Stream<unknown>) {}

  public connect(target: ISubscriber<T[]>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new BufferSubscriber<T>(target, this.shouldFlushBufferStream)
    )
  }
}

class BufferSubscriber<T> extends DoubleInputValueTransmitter<T, T[], unknown> {
  private buffer: T[] = []

  constructor(
    target: ISubscriber<T[]>,
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
}
