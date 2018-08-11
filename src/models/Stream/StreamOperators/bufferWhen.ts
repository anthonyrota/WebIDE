import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function bufferWhen<T>(
  getShouldCloseBufferStream: () => Stream<unknown>
): IOperator<T, T[]> {
  return new BufferWhenOperator<T>(getShouldCloseBufferStream)
}

class BufferWhenOperator<T> implements IOperator<T, T[]> {
  constructor(private getShouldCloseBufferStream: () => Stream<unknown>) {}

  public connect(target: ISubscriber<T[]>, source: Stream<T>): DisposableLike {
    return source.subscribe(
      new BufferWhenSubscriber(target, this.getShouldCloseBufferStream)
    )
  }
}

class BufferWhenSubscriber<T> extends DoubleInputValueTransmitter<
  T,
  T[],
  unknown
> {
  private buffer: T[] = []
  private isSubscribing: boolean = false
  private shouldCloseBufferStreamSubscription: IDisposable | null = null

  constructor(
    target: ISubscriber<T[]>,
    private getShouldCloseBufferStream: () => Stream<unknown>
  ) {
    super(target)
    this.openBuffer()
  }

  protected onNextValue(value: T) {
    this.buffer.push(value)
  }

  protected onComplete(): void {
    if (this.buffer.length > 0) {
      this.destination.next(this.buffer)
    }
    this.destination.complete()
  }

  protected onOuterNextValue(): void {
    this.closeBuffer()
  }

  protected onOuterComplete(): void {
    if (this.isSubscribing) {
      this.destination.complete()
    } else {
      this.closeBuffer()
    }
  }

  protected closeBuffer(): void {
    if (this.shouldCloseBufferStreamSubscription) {
      this.shouldCloseBufferStreamSubscription.dispose()
      this.shouldCloseBufferStreamSubscription = null
    }

    this.destination.next(this.buffer)
    this.buffer = []
  }

  protected openBuffer(): void {
    const { getShouldCloseBufferStream } = this
    let shouldCloseBufferStream: Stream<unknown>

    try {
      shouldCloseBufferStream = getShouldCloseBufferStream()
    } catch (error) {
      this.destination.error(error)
      return
    }

    this.isSubscribing = true
    this.shouldCloseBufferStreamSubscription = this.subscribeStreamToSelf(
      shouldCloseBufferStream
    )
    this.isSubscribing = false
  }
}
