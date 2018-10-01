import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function fromPromiseScheduled<T>(
  promise: PromiseLike<T>,
  scheduler: IScheduler
): Stream<T> {
  return new RawStream<T>(target => {
    return scheduler.schedule(() => {
      promise.then(
        value => {
          target.addOnStopReceivingValues(
            scheduler.schedule(() => {
              target.next(value)
              target.addOnStopReceivingValues(
                scheduler.schedule(() => {
                  target.complete()
                })
              )
            })
          )
        },
        error => {
          target.addOnStopReceivingValues(
            scheduler.schedule(() => {
              target.error(error)
            })
          )
        }
      )
    })
  })
}
