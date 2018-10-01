import { Operation } from 'src/models/Stream/Operation'
import { takeLast } from 'src/models/Stream/StreamOperators/takeLast'

export function last<T>(): Operation<T, T> {
  return takeLast(1)
}
