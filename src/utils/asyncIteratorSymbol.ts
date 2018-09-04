declare global {
  // tslint:disable-next-line
  interface AsyncIterable<T> {
    [asyncIteratorSymbolType](): AsyncIterator<T>
  }
}

export const asyncIteratorSymbolType: unique symbol = getAsyncIteratorSymbol()

export function getAsyncIteratorSymbol(): typeof asyncIteratorSymbolType {
  // @ts-ignore
  return typeof Symbol === 'function'
    ? Symbol.asyncIterator ||
        (Symbol.for ? Symbol.for('asyncIterator') : Symbol('asyncIterator'))
    : ('@@asyncIterator' as any)
}
