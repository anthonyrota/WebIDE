import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function fromAsyncIterableScheduled<T>(
  iterable: AsyncIterable<T>,
  scheduler: IScheduler,
  delay: number = 0
): Stream<T> {
  return new RawStream<T>(target => {
    return scheduler.scheduleDelayed(() => {
      const iterator = iterable[Symbol.asyncIterator]()

      target.addOnStopReceivingValues(
        scheduler.scheduleDelayed(action => {
          let resultPromise: Promise<IteratorResult<T>>

          try {
            resultPromise = iterator.next()
          } catch (error) {
            target.error(error)
            return
          }

          resultPromise.then(
            result => {
              if (result.done) {
                target.complete()
              } else {
                target.next(result.value)
                action.scheduleDelayed(delay)
              }
            },
            error => {
              target.error(error)
            }
          )
        }, delay)
      )
    }, delay)
  })
}
