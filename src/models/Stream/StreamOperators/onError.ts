import { Operation } from '../Operation'
import { spy } from './spy'

export function onError<T>(error: (error: unknown) => void): Operation<T, T> {
  return spy({ error })
}
