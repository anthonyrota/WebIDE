import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { empty } from 'src/models/Stream/StreamConstructors/empty'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function startNextOnErrorOrComplete<T>(
  ...streams: Array<Stream<T>>
): Stream<T> {
  return streams.length === 0
    ? empty()
    : new RawStream<T>(
        target =>
          new StartNextOnErrorOrCompleteValueTransmitter<T>(target, streams)
      )
}

class StartNextOnErrorOrCompleteValueTransmitter<
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
