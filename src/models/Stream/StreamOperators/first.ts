import { Operation } from 'src/models/Stream/Operation'
import { take } from './take'

export function first<T>(): Operation<T, T> {
  return take(1)
}
