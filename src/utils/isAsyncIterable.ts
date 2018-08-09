import { $$asyncIterator } from 'src/utils/asyncIteratorSymbol'

export function isAsyncIterable(value: any): value is AsyncIterable<unknown> {
  return value != null && typeof value[$$asyncIterator] === 'function'
}
