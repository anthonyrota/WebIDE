import { isCallable } from 'src/utils/isCallable'

export function isIterable(value: any): value is Iterable<unknown> {
  return value != null && isCallable(value[Symbol.iterator])
}
