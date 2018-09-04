import { getIteratorSymbol } from 'src/utils/iteratorSymbol'

export function isIterable(value: any): value is Iterable<unknown> {
  return value != null && typeof value[getIteratorSymbol()] === 'function'
}
