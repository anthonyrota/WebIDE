import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function emptyScheduled(scheduler: IScheduler): Stream<never> {
  return new RawStream(target => {
    return scheduler.schedule(() => target.complete())
  })
}
