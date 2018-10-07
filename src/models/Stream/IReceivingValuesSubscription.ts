import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { isCallable } from 'src/utils/isCallable'

export const isReceivingValuesSubscriptionPropertyKey =
  '@@__ReceivingValuesSubscriptionClassEqualityCheckKey__@@'

export function isReceivingValuesSubscription(
  candidate: any
): candidate is IReceivingValueSubscription {
  return (
    candidate != null &&
    candidate[isReceivingValuesSubscriptionPropertyKey] === true &&
    isCallable(candidate.isReceivingValues) &&
    isCallable(candidate.getOnStopReceivingValuesSubscription)
  )
}

export interface IReceivingValueSubscription {
  readonly [isReceivingValuesSubscriptionPropertyKey]: true
  addOnStopReceivingValues(disposableLike: DisposableLike): void
  removeOnStopReceivingValues(disposableLike: DisposableLike): void
  isReceivingValues(): boolean
}
