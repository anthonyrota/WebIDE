declare global {
  // tslint:disable-next-line
  interface Array<T> {
    [$$iterator](): Iterator<T>
  }

  interface Iterable<T> {
    [$$iterator](): Iterator<T>
  }
}

// @ts-ignore
export const $$iterator: unique symbol =
  typeof Symbol === 'function'
    ? Symbol.iterator ||
      (Symbol.for ? Symbol.for('iterator') : Symbol('iterator'))
    : ('@@iterator' as any)
