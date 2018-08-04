import { $$asyncIterator } from 'src/utils/asyncIteratorSymbol'

export function isAsyncIterable(value: any): value is AsyncIterable<any> {
  return value != null && typeof value[$$asyncIterator] === 'function'
}
