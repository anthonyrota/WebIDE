import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function delayedIntervalScheduled(
  scheduler: IScheduler,
  startAfter: number,
  delayBetweenNumbers: number = 0
): Stream<number> {
  return new RawStream<number>(target => {
    return scheduler.scheduleDelayedWithData<number>(
      (index, action) => {
        target.next(index)
        action.scheduleDelayedWithData(delayBetweenNumbers, index)
      },
      startAfter,
      0
    )
  })
}
