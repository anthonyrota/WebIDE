import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Operation, transform } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { concatScheduled } from 'src/models/Stream/StreamConstructors/concatScheduled'

export function concatScheduledWith<T>(
  streams: Array<Stream<T>>,
  scheduler: IScheduler
): Operation<T, T> {
  return transform(source => concatScheduled([source, ...streams], scheduler))
}
