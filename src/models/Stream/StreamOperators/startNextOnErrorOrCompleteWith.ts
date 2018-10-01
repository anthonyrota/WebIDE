import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function startNextOnErrorOrCompleteWith<T>(
  ...sources: Array<Stream<T>>
): Operation<T, T> {
  return operateThroughValueTransmitter(
    target =>
      new StartNextOnErrorOrCompleteWithValueTransmitter(target, sources)
  )
}

class StartNextOnErrorOrCompleteWithValueTransmitter<
  T
> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriptionTarget<T>, private streams: Array<Stream<T>>) {
    super(target)
    this.subscribeToNextStream()
  }

  public error(): void {
    if (this.isActive()) {
      this.disposeAndRecycle()
      this.subscribeToNextStream()
    }
  }

  public complete(): void {
    if (this.isActive()) {
      this.disposeAndRecycle()
      this.subscribeToNextStream()
    }
  }

  private subscribeToNextStream(): void {
    const stream = this.streams.shift()

    if (!stream) {
      this.destination.complete()
      return
    }

    stream.subscribe(this)
  }
}
