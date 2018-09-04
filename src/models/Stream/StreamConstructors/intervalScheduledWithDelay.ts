import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function intervalScheduledWithDelay(
  scheduler: IScheduler,
  delay: number
): Stream<number> {
  return new RawStream<number>(target => {
    return scheduler.scheduleDelayedWithData<number>(
      (index, action) => {
        target.next(index)
        action.scheduleDelayedWithData(delay, index)
      },
      delay,
      0
    )
  })
}
