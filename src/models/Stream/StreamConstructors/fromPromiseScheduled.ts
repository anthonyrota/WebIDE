import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function fromPromiseScheduled<T>(
  promise: PromiseLike<T>,
  scheduler: IScheduler,
  delay: number = 0
): Stream<T> {
  return new RawStream<T>(target => {
    return scheduler.scheduleDelayed(() => {
      promise.then(
        value => {
          target.addOnStopReceivingValues(
            scheduler.scheduleDelayed(() => {
              target.next(value)
              target.addOnStopReceivingValues(
                scheduler.scheduleDelayed(() => {
                  target.complete()
                }, delay)
              )
            }, delay)
          )
        },
        error => {
          target.addOnStopReceivingValues(
            scheduler.scheduleDelayed(() => {
              target.error(error)
            }, delay)
          )
        }
      )
    }, delay)
  })
}
