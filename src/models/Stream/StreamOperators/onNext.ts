import { Operation } from '../Operation'
import { spy } from './spy'

export function onNext<T>(next: (value: T) => void): Operation<T, T> {
  return spy({ next })
}
