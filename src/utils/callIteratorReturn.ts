export function callIteratorReturn<T>(iterator: IterableIterator<T>): void {
  if (typeof iterator.return === 'function') {
    iterator.return()
  }
}
