import { IOperator } from 'src/models/Stream/IOperator'
import { reduce } from 'src/models/Stream/StreamOperators/reduce'

export function maxCompared<T>(
  compare: (a: T, b: T) => number
): IOperator<T, T> {
  return reduce((a: T, b: T) => (compare(a, b) > 0 ? a : b))
}
