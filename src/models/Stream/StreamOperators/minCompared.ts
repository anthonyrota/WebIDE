import { Operation } from 'src/models/Stream/Operation'
import { reduce } from 'src/models/Stream/StreamOperators/reduce'

export function maxCompared<T>(
  compare: (a: T, b: T) => number
): Operation<T, T> {
  return reduce((a: T, b: T) => (compare(a, b) < 0 ? a : b))
}
