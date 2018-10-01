import { Operation } from '../Operation'
import { tap } from './tap'

export function tapError<T>(error: (error: unknown) => void): Operation<T, T> {
  return tap({ error })
}
