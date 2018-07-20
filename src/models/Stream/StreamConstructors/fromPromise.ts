import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { asyncReportError } from 'src/utils/asyncReportError'

export function fromPromise<T>(promise: PromiseLike<T>): Stream<T> {
  return new FromPromiseStream<T>(promise)
}

class FromPromiseStream<T> extends Stream<T> {
  constructor(private __promise: PromiseLike<T>) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    this.__promise
      .then(onValue.bind(null, target), onError.bind(null, target))
      .then(null, asyncReportError)
  }
}

function onValue<T>(target: MonoTypeValueTransmitter<T>, value: T): void {
  target.next(value)
  target.complete()
}

function onError<T>(target: MonoTypeValueTransmitter<T>, error: any) {
  target.error(error)
}
