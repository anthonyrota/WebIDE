import { Operation } from '../Operation'
import { spy } from './spy'

export function onComplete<T>(complete: () => void): Operation<T, T> {
  return spy({ complete })
}
