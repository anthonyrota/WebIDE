import { IDisposable } from 'src/models/Disposable/IDisposable'
import { ISubscription } from 'src/models/Disposable/Subscription'

export const isReceivingValuesSubscriptionPropertyKey =
  '@@__ReceivingValuesSubscriptionClassEqualityCheckKey__@@'

export function isReceivingValuesSubscription(
  candidate: any
): candidate is IReceivingValuesSubscription {
  return (
    candidate != null &&
    candidate[isReceivingValuesSubscriptionPropertyKey] === true
  )
}

export interface IReceivingValuesSubscription {
  readonly [isReceivingValuesSubscriptionPropertyKey]: true
  terminateDisposableWhenStopsReceivingValues(
    disposable: IDisposable
  ): ISubscription
  terminateDisposableLikeWhenStopsReceivingValues(
    disposableLike: IDisposable
  ): ISubscription
  onStopReceivingValues(dispose: () => void): ISubscription
  removeOnStopReceivingValuesSubscription(subscription: ISubscription): void
  isReceivingValues(): boolean
}
