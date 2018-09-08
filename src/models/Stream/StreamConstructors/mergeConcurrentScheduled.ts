import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Stream } from 'src/models/Stream/Stream'
import { fromArrayScheduled } from 'src/models/Stream/StreamConstructors/fromArrayScheduled'
import { mergeAllConcurrent } from 'src/models/Stream/StreamOperators/mergeAllConcurrent'

export function mergeConcurrentScheduled<T>(
  sources: Array<Stream<T>>,
  concurrency: number,
  scheduler: IScheduler
): Stream<T> {
  return fromArrayScheduled(sources, scheduler).lift(
    mergeAllConcurrent(concurrency)
  )
}
