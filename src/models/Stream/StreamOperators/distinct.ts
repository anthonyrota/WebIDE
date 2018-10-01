import { Operation } from 'src/models/Stream/Operation'
import { identity } from 'src/utils/identity'
import { distinctWithKeySelector } from './distinctWithKeySelector'

export function distinct<T>(): Operation<T, T> {
  return distinctWithKeySelector(identity)
}
