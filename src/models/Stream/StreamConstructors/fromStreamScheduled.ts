import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { IInteropStream, RawStream, Stream } from 'src/models/Stream/Stream'
import { scheduleMessagesDelayed } from '../StreamOperators/scheduleMessagesDelayed'
import { fromStream } from './fromStream'

export function fromStreamScheduled<T>(
  input: IInteropStream<T>,
  scheduler: IScheduler,
  delay: number = 0
): Stream<T> {
  return new RawStream(target => {
    return scheduler.scheduleDelayed(() => {
      target.addOnStopReceivingValues(
        fromStream(input)
          .lift(scheduleMessagesDelayed(scheduler, delay))
          .subscribe(target)
      )
    }, delay)
  })
}
