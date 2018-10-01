import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { publishReplayed } from './publishReplayed'

export function publishReplayedWithTimeLimit<T, U>(
  createValueStream: (shared: Stream<T>) => Stream<U>,
  timeLimit: number,
  bufferSize?: number
): Operation<T, U> {
  return publishReplayed(createValueStream, bufferSize, timeLimit)
}
