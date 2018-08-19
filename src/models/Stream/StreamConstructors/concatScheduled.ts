import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Stream } from 'src/models/Stream/Stream'
import { fromArrayScheduled } from 'src/models/Stream/StreamConstructors/fromArrayScheduled'
import { concatAll } from 'src/models/Stream/StreamOperators/concatAll'

export function concatScheduled<T>(
  streams: Array<Stream<T>>,
  scheduler: IScheduler
): Stream<T> {
  return fromArrayScheduled(streams, scheduler).lift(concatAll())
}
