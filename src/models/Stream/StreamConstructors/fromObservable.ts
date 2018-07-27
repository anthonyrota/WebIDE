import { IESInteropObservable } from 'src/models/Stream/ESObservable'
import { ESObservableSubscriptionDisposable } from 'src/models/Stream/ESObservableSubscriptionDisposable'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { toESObservable } from 'src/utils/toESObservable'

export function fromObservable<T>(input: IESInteropObservable<T>): Stream<T> {
  return new RawStream<T>(target => {
    return new ESObservableSubscriptionDisposable(
      toESObservable(input).subscribe(target)
    )
  })
}
