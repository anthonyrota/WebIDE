import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { delayedComplete } from './delayedComplete'

export function fromArrayScheduled<T>(
  array: ArrayLike<T>,
  scheduler: IScheduler,
  delay: number = 0
): Stream<T> {
  return array.length === 0
    ? delayedComplete(delay, scheduler)
    : new RawStream<T>(target => {
        return scheduler.scheduleDelayedWithData<number>(
          (index, action) => {
            if (index >= array.length) {
              target.complete()
            } else {
              target.next(array[index])
              action.scheduleDelayedWithData(delay, index + 1)
            }
          },
          delay,
          0
        )
      })
}
