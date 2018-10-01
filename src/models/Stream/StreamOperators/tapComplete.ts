import { Operation } from '../Operation'
import { tap } from './tap'

export function tapComplete<T>(complete: () => void): Operation<T, T> {
  return tap({ complete })
}
