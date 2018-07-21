import { $$iterator } from 'src/utils/iteratorSymbol'

export function isIterable(value: any): value is Iterable<any> {
  return !!value && typeof value[$$iterator] === 'function'
}
