import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Operation } from 'src/models/Stream/Operation'
import { delayedComplete } from 'src/models/Stream/StreamConstructors/delayedComplete'
import { audit } from 'src/models/Stream/StreamOperators/audit'

export function auditTime<T>(
  duration: number,
  scheduler?: IScheduler
): Operation<T, T> {
  const delayed = delayedComplete(duration, scheduler)

  return audit(() => delayed)
}
