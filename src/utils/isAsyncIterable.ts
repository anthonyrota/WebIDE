import { $$asyncIterator, IAsyncIterable } from 'src/utils/asyncIteratorSymbol'

export function isAsyncIterable(value: any): value is IAsyncIterable<any> {
  return !!value && typeof value[$$asyncIterator] === 'function'
}
