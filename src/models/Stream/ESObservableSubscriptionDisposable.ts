import { IESObservableSubscription } from 'src/models/Stream/ESObservable'
import { isCallable } from 'src/utils/isCallable'
import {
  isSubscription,
  ISubscription,
  Subscription
} from '../Disposable/Subscription'

export function convertESObservableSubscriptionToSubscription(
  esObservableSubscription: IESObservableSubscription
): ISubscription {
  if (isSubscription(esObservableSubscription)) {
    return esObservableSubscription
  }

  if (isRxJSLikeSubscription(esObservableSubscription)) {
    const unsubscribe = () => {
      esObservableSubscription.remove(unsubscribe)
      subscription.dispose()
    }

    const subscription = Subscription.from(() => {
      esObservableSubscription.remove(unsubscribe)

      if (!esObservableSubscription.closed) {
        esObservableSubscription.unsubscribe()
      }
    })

    esObservableSubscription.add(unsubscribe)
  }

  return Subscription.from(() => {
    if (!esObservableSubscription.closed) {
      esObservableSubscription.unsubscribe()
    }
  })
}

function isRxJSLikeSubscription(
  subscription: any
): subscription is IRxJSLikeSubscription {
  return (
    isCallable(subscription.unsubscribe) &&
    isCallable(subscription.add) &&
    isCallable(subscription.remove)
  )
}

interface IRxJSLikeSubscription {
  add(dispose: () => void): void
  remove(dispose: () => void): void
}
