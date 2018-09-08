import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Stream } from 'src/models/Stream/Stream'
import { fromArrayScheduled } from 'src/models/Stream/StreamConstructors/fromArrayScheduled'
import { mergeAll } from 'src/models/Stream/StreamOperators/mergeAll'

export function mergeScheduled<T>(
  sources: Array<Stream<T>>,
  scheduler: IScheduler
): Stream<T> {
  return fromArrayScheduled(sources, scheduler).lift(mergeAll())
}
