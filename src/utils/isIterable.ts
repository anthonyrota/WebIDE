import { $$iterator } from 'src/utils/iteratorSymbol'

export function isIterable(value: any): value is Iterable<unknown> {
  return value != null && typeof value[$$iterator] === 'function'
}
