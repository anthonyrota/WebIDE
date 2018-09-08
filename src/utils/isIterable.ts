export function isIterable(value: any): value is Iterable<unknown> {
  return value != null && typeof value[Symbol.iterator] === 'function'
}
