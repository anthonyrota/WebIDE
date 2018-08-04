declare global {
  // tslint:disable-next-line
  interface AsyncIterable<T> {
    [$$asyncIterator](): AsyncIterator<T>
  }
}

// @ts-ignore
export const $$asyncIterator: unique symbol =
  typeof Symbol === 'function'
    ? Symbol.asyncIterator ||
      (Symbol.for ? Symbol.for('asyncIterator') : Symbol('asyncIterator'))
    : ('@@asyncIterator' as any)
