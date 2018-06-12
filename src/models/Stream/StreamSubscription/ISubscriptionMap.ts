import { ISubscription } from 'src/models/Stream/StreamSubscription/ISubscription'
import { IStreamListeners } from 'src/models/Stream/StreamSubscription/StreamListeners'

export interface ISubscriptionMap<T> {
  [subscriptionId: number]: {
    listeners: IStreamListeners<T>
    subscription: ISubscription
  }
}
