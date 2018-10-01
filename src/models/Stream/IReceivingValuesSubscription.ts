import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { isFunction } from 'src/utils/isFunction'

export const isReceivingValuesSubscriptionPropertyKey =
  '@@__ReceivingValuesSubscriptionClassEqualityCheckKey__@@'

export function isReceivingValuesSubscription(
  candidate: any
): candidate is IReceivingValueSubscription {
  return (
    candidate != null &&
    candidate[isReceivingValuesSubscriptionPropertyKey] === true &&
    isFunction(candidate.isReceivingValues) &&
    isFunction(candidate.getOnStopReceivingValuesSubscription)
  )
}

export interface IReceivingValueSubscription {
  readonly [isReceivingValuesSubscriptionPropertyKey]: true
  addOnStopReceivingValues(disposableLike: DisposableLike): void
  removeOnStopReceivingValues(disposableLike: DisposableLike): void
  isReceivingValues(): boolean
}
