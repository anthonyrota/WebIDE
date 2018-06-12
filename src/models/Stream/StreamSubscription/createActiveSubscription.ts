import { ActiveSubscription } from 'src/models/Stream/StreamSubscription/ActiveStreamSubscription'
import { generateSubscriptionId } from 'src/models/Stream/StreamSubscription/generateSubscriptionId'
import { ISubscriptionMap } from 'src/models/Stream/StreamSubscription/ISubscriptionMap'
import { IStreamListeners } from 'src/models/Stream/StreamSubscription/StreamListeners'
import { curry2 } from 'src/utils/curry'

export const createActiveSubscription: {
  <T>(listeners: IStreamListeners<T>): (
    subscriptionMap: ISubscriptionMap<T>
  ) => ActiveSubscription<T>
  <T>(
    listeners: IStreamListeners<T>,
    subscriptionMap: ISubscriptionMap<T>
  ): ActiveSubscription<T>
} = curry2(
  <T>(
    listeners: IStreamListeners<T>,
    subscriptionMap: ISubscriptionMap<T>
  ): ActiveSubscription<T> => {
    return new ActiveSubscription<T>(
      listeners,
      subscriptionMap,
      generateSubscriptionId()
    )
  }
)
