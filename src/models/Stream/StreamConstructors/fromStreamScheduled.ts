import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { ScheduledSubscriber } from 'src/models/Stream/ScheduledSubscriber'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function fromStreamScheduled<T>(
  source: Stream<T>,
  scheduler: IScheduler
): Stream<T> {
  return new RawStream<T>(target => {
    return source.subscribe(new ScheduledSubscriber<T>(target, scheduler))
  })
}
