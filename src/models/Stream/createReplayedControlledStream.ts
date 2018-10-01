import { IControlledStream } from './ControlledStream'
import { ReplayedControlledStream } from './ReplayedControlledStream'
import { ReplayedControlledStreamWithTimeLimit } from './ReplayedControlledStreamWithTimeLimit'

export function createReplayedControlledStream<T>(
  bufferSize?: number,
  timeLimit?: number
): IControlledStream<T, T> {
  return typeof timeLimit === 'undefined'
    ? new ReplayedControlledStream(bufferSize)
    : new ReplayedControlledStreamWithTimeLimit(timeLimit, bufferSize)
}
