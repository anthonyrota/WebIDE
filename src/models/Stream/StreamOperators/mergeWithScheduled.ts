import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Operation, transform } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { mergeScheduled } from 'src/models/Stream/StreamConstructors/mergeScheduled'

export function mergeWithScheduled<T>(
  streams: Array<Stream<T>>,
  scheduler: IScheduler
): Operation<T, T> {
  return transform(source => mergeScheduled([source, ...streams], scheduler))
}
