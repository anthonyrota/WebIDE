import { Operation } from 'src/models/Stream/Operation'
import { filter } from './filter'

export function nth<T>(targetIndex: number): Operation<T, T> {
  if (targetIndex < 0) {
    throw new Error('targetIndex cannot be negative')
  }
  return filter((_, index) => index === targetIndex)
}
