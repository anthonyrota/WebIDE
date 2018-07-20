import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function of<T>(value: T): Stream<T> {
  return new OfStream<T>(value)
}

class OfStream<T> extends Stream<T> {
  constructor(private __value: T) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    target.next(this.__value)
    target.complete()
  }
}
