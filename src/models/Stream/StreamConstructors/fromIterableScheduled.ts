import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function fromIterableScheduled<T>(
  iterable: Iterable<T>,
  scheduler: IScheduler
): Stream<T> {
  return new RawStream<T>(target => {
    return scheduler.schedule(() => {
      const iterator = iterable[Symbol.iterator]()

      target.addOnStopReceivingValues(
        scheduler.schedule(action => {
          let result: IteratorResult<T>

          try {
            result = iterator.next()
          } catch (error) {
            target.error(error)
            return
          }

          if (result.done) {
            target.complete()
          } else {
            target.next(result.value)
            action.schedule()
          }
        })
      )
    })
  })
}
