declare global {
  // tslint:disable-next-line
  interface Array<T> {
    [iteratorSymbolType](): Iterator<T>
  }

  interface Iterable<T> {
    [iteratorSymbolType](): Iterator<T>
  }
}

export const iteratorSymbolType: unique symbol = getIteratorSymbol()

export function getIteratorSymbol(): typeof iteratorSymbolType {
  // @ts-ignore
  return typeof Symbol === 'function'
    ? Symbol.iterator ||
        (Symbol.for ? Symbol.for('iterator') : Symbol('iterator'))
    : ('@@iterator' as any)
}
