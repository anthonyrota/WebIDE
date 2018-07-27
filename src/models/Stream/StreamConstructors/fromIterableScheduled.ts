import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { $$iterator } from 'src/utils/iteratorSymbol'

export function fromIterableScheduled<T>(
  iterable: Iterable<T>,
  scheduler: IScheduler
): Stream<T> {
  return new RawStream<T>(target => {
    return scheduler.schedule(() => {
      const iterator = iterable[$$iterator]()

      target.terminateDisposableWhenDisposed(
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
