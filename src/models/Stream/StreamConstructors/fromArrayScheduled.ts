import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { emptyScheduled } from 'src/models/Stream/StreamConstructors/emptyScheduled'

export function fromArrayScheduled<T>(
  array: ArrayLike<T>,
  scheduler: IScheduler
): Stream<T> {
  return array.length === 0
    ? emptyScheduled(scheduler)
    : new RawStream<T>(target => {
        return scheduler.scheduleWithData<number>((index, action) => {
          if (index >= array.length) {
            target.complete()
          } else {
            target.next(array[index])
            action.schedule(index + 1)
          }
        }, 0)
      })
}
