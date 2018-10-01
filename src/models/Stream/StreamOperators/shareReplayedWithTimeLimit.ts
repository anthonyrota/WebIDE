import { Operation } from '../Operation'
import { shareReplayed } from './shareReplayed'

export function shareReplayedWithTimeLimit<T>(
  timeLimit: number,
  bufferSize?: number
): Operation<T, T> {
  return shareReplayed(bufferSize, timeLimit)
}
