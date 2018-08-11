import { delay } from 'src/models/Scheduler/delay'
import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { ofValueDelayed } from 'src/models/Stream/StreamConstructors/ofValueDelayed'
import { audit } from 'src/models/Stream/StreamOperators/audit'

export function auditTime<T>(duration: number, scheduler: IScheduler = delay) {
  return audit(() => ofValueDelayed(undefined, duration))
}
