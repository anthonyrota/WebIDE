import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Operation } from 'src/models/Stream/Operation'
import { scheduleMessagesDelayed } from './scheduleMessagesDelayed'

export function scheduleMessages<T>(scheduler: IScheduler): Operation<T, T> {
  return scheduleMessagesDelayed(scheduler, 0)
}
