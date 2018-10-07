import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { IESInteropObservable } from 'src/models/Stream/ESObservable'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { scheduleMessagesDelayed } from '../StreamOperators/scheduleMessagesDelayed'
import { fromObservable } from './fromObservable'

export function fromObservableScheduled<T>(
  input: IESInteropObservable<T>,
  scheduler: IScheduler,
  delay: number = 0
): Stream<T> {
  return new RawStream(target => {
    return scheduler.scheduleDelayed(() => {
      target.addOnStopReceivingValues(
        fromObservable(input)
          .lift(scheduleMessagesDelayed(scheduler, delay))
          .subscribe(target)
      )
    }, delay)
  })
}
