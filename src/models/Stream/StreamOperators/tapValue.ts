import { Operation } from '../Operation'
import { tap } from './tap'

export function tapValue<T>(next: (value: T) => void): Operation<T, T> {
  return tap({ next })
}
