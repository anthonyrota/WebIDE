import { createReplayedControlledStream } from 'src/models/Stream/createReplayedControlledStream'
import { Operation } from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { multicast } from 'src/models/Stream/StreamOperators/multicast'

export function publishReplayed<T, U>(
  createValueStream: (shared: Stream<T>) => Stream<U>,
  bufferSize?: number,
  timeLimit?: number
): Operation<T, U> {
  return multicast<T, U>(
    () => createReplayedControlledStream(bufferSize, timeLimit),
    createValueStream
  )
}
