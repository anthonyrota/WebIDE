import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { emptyScheduled } from '../StreamConstructors/emptyScheduled'
import { delaySubscription } from './delaySubscription'

export function scheduleSubscriptionWithDelay<T>(scheduler: IScheduler) {
  return delaySubscription(emptyScheduled(scheduler))
}
