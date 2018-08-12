import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { IOperator } from 'src/models/Stream/IOperator'
import { delayedComplete } from 'src/models/Stream/StreamConstructors/delayedComplete'
import { audit } from 'src/models/Stream/StreamOperators/audit'

export function auditTime<T>(
  duration: number,
  scheduler?: IScheduler
): IOperator<T, T> {
  const delayed = delayedComplete(duration, scheduler)

  return audit(() => delayed)
}
