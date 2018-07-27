import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function intervalScheduled(scheduler: IScheduler): Stream<number> {
  return new RawStream<number>(target => {
    return scheduler.scheduleWithData<number>((index, action) => {
      target.next(index)
      action.schedule(index + 1)
    }, 0)
  })
}
