import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function defer<T>(createStream: () => Stream<T>): Stream<T> {
  return new DeferStream<T>(createStream)
}

class DeferStream<T> extends Stream<T> {
  constructor(private __createStream: () => Stream<T>) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    const createStream = this.__createStream
    const source = createStream()

    return source.subscribe(target)
  }
}
