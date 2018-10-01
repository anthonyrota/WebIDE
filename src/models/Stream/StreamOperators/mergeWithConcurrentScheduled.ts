import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Operation, transform } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { mergeConcurrentScheduled } from 'src/models/Stream/StreamConstructors/mergeConcurrentScheduled'

export function mergeWithConcurrentScheduled<T>(
  streams: Array<Stream<T>>,
  concurrency: number,
  scheduler: IScheduler
): Operation<T, T> {
  return transform(source =>
    mergeConcurrentScheduled([source, ...streams], concurrency, scheduler)
  )
}
