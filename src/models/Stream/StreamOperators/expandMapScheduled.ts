import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { expandMapConcurrentScheduled } from './expandMapConcurrentScheduled'

export function expandMapScheduled<T>(
  convertValueToStream: (value: T, index: number) => Stream<T>,
  scheduler: IScheduler
): Operation<T, T> {
  return expandMapConcurrentScheduled(convertValueToStream, Infinity, scheduler)
}
