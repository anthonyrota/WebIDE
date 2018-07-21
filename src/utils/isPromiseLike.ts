export function isPromiseLike(value: any): value is PromiseLike<any> {
  return (
    !!value &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof value.then === 'function'
  )
}
