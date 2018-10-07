import { IESInteropObservable } from 'src/models/Stream/ESObservable'
import { convertESObservableSubscriptionToSubscription } from 'src/models/Stream/ESObservableSubscriptionDisposable'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { toESObservable } from 'src/utils/toESObservable'

export function fromObservable<T>(input: IESInteropObservable<T>): Stream<T> {
  return new RawStream<T>(target => {
    return convertESObservableSubscriptionToSubscription(
      toESObservable(input).subscribe(target)
    )
  })
}
