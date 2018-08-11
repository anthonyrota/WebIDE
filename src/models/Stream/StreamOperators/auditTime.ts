import { delay } from 'src/models/Scheduler/delay'
import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { ofValueScheduledWithDelay } from 'src/models/Stream/StreamConstructors/ofValueScheduledWithDelay'
import { audit } from 'src/models/Stream/StreamOperators/audit'

export function auditTime<T>(duration: number, scheduler: IScheduler = delay) {
  const delayed = ofValueScheduledWithDelay(undefined, scheduler, duration)

  return audit(() => delayed)
}
