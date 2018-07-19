import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export function fromArray<T>(array: ArrayLike<T>): Stream<T> {
  return new FromArrayStream<T>(array)
}

class FromArrayStream<T> extends Stream<T> {
  constructor(private __inputArray: ArrayLike<T>) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    for (let i = 0; i < this.__inputArray.length; i++) {
      target.next(this.__inputArray[i])
    }
    target.complete()
  }
}
