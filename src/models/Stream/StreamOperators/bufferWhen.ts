import { IDisposable } from 'src/models/Disposable/IDisposable'
import { DoubleInputValueTransmitter } from 'src/models/Stream/DoubleInputValueTransmitter'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'

export function bufferWhen<T>(
  getShouldCloseBufferStream: () => Stream<unknown>
): Operation<T, T[]> {
  return operateThroughValueTransmitter(
    target => new BufferWhenValueTransmitter(target, getShouldCloseBufferStream)
  )
}

class BufferWhenValueTransmitter<T> extends DoubleInputValueTransmitter<
  T,
  T[],
  unknown
> {
  private buffer: T[] = []
  private isSubscribing: boolean = false
  private shouldCloseBufferStreamSubscription: IDisposable | null = null

  constructor(
    target: ISubscriptionTarget<T[]>,
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
    this.openBuffer()
  }

  protected onOuterComplete(): void {
    if (this.isSubscribing) {
      if (this.buffer.length > 0) {
        this.destination.next(this.buffer)
      }
      this.destination.complete()
    } else {
      this.closeBuffer()
      this.openBuffer()
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
