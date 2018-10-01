import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { keys } from 'src/utils/keys'

export function ofEntriesScheduled<T>(
  object: T,
  scheduler: IScheduler
): Stream<{ [K in keyof T]: [K, T[K]] }[keyof T]> {
  return new RawStream(target => {
    const objectKeys = keys(object)

    return scheduler.scheduleWithData<number>((index, action) => {
      if (index >= objectKeys.length) {
        target.complete()
      } else {
        const key = objectKeys[index] as keyof T

        if (Object.prototype.hasOwnProperty.call(object, key)) {
          target.next([key, object[key]])
        }

        action.scheduleWithData(index + 1)
      }
    }, 0)
  })
}
