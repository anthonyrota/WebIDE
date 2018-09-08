import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function fromAsyncIterableScheduled<T>(
  iterable: AsyncIterable<T>,
  scheduler: IScheduler
): Stream<T> {
  return new RawStream<T>(target => {
    return scheduler.schedule(() => {
      const iterator = iterable[Symbol.asyncIterator]()

      target.add(
        scheduler.schedule(action => {
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
                action.schedule()
              }
            },
            error => {
              target.error(error)
            }
          )
        })
      )
    })
  })
}
