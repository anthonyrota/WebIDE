import { isCallable } from 'src/utils/isCallable'

export function isAsyncIterable(value: any): value is AsyncIterable<unknown> {
  return value != null && isCallable(value[Symbol.asyncIterator])
}
