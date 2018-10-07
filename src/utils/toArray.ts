import { isIterable } from './isIterable'

export function toArray<T>(items: Iterable<T> | ArrayLike<T>): T[] {
  return isIterable(items) ? [...items] : ([] as T[]).slice.call(items)
}
