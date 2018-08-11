import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function ofValueScheduledWithDelay<T>(
  value: T,
  scheduler: IScheduler,
  delay: number
): Stream<T> {
  return new RawStream<T>(target => {
    return scheduler.scheduleDelayed(() => {
      target.next(value)
    }, delay)
  })
}
