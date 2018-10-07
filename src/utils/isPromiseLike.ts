import { isCallable } from 'src/utils/isCallable'

export function isPromiseLike(value: any): value is PromiseLike<unknown> {
  return value != null && isCallable(value.then)
}
