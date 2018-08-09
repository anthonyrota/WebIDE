export function isPromiseLike(value: any): value is PromiseLike<unknown> {
  return value != null && typeof value.then === 'function'
}
