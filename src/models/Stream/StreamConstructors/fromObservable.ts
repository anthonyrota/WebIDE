import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { IESInteropObservable } from 'src/models/Stream/ESObservable'
import { ESObservableSubscriptionDisposable } from 'src/models/Stream/ESObservableSubscriptionDisposable'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { toESObservable } from 'src/utils/toESObservable'

export function fromObservable<T>(input: IESInteropObservable<T>): Stream<T> {
  return new FromObservableStream<T>(input)
}

export class FromObservableStream<T> extends Stream<T> {
  constructor(private __input: IESInteropObservable<T>) {
    super()
  }

  protected trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    return new ESObservableSubscriptionDisposable(
      toESObservable<T>(this.__input).subscribe(target)
    )
  }
}
