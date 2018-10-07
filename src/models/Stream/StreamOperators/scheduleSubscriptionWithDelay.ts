import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { delayedComplete } from '../StreamConstructors/delayedComplete'
import { delaySubscription } from './delaySubscription'

export function scheduleSubscriptionWithDelay<T>(
  scheduler: IScheduler,
  delay: number
) {
  return delaySubscription(delayedComplete(delay, scheduler))
}
