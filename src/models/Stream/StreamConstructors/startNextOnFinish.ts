import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { empty } from 'src/models/Stream/StreamConstructors/empty'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function startNextOnFinish<T>(...streams: Array<Stream<T>>): Stream<T> {
  return streams.length === 0
    ? empty()
    : new RawStream<T>(
        target => new StartNextOnFinishValueTransmitter<T>(target, streams)
      )
}

class StartNextOnFinishValueTransmitter<T> extends MonoTypeValueTransmitter<T> {
  constructor(target: ISubscriber<T>, private streams: Array<Stream<T>>) {
    super(target)
    this.subscribeToNextStream()
  }

  protected onError(): void {
    this.subscribeToNextStream()
  }

  protected onComplete(): void {
    this.subscribeToNextStream()
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
