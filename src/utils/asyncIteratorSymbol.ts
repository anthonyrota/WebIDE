export interface IAsyncIterator<T> {
  next(value?: any): Promise<IteratorResult<T>>
  return?(value?: any): Promise<IteratorResult<T>>
  throw?(e?: any): Promise<IteratorResult<T>>
}

export interface IAsyncIterable<T> {
  [$$asyncIterator](): IAsyncIterator<T>
}

export interface IAsyncIterableIterator<T> extends IAsyncIterator<T> {
  [$$asyncIterator](): IAsyncIterableIterator<T>
}

// @ts-ignore
export const $$asyncIterator: unique symbol =
  typeof Symbol === 'function'
    ? (Symbol as any).asyncIterator || Symbol('asyncIterator')
    : ('@@asyncIterator' as any)
