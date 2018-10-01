import { Operation, transform } from 'src/models/Stream/Operation'
import { identity } from 'src/utils/identity'

export function copySource<T>(): Operation<T, T> {
  return transform(identity)
}
