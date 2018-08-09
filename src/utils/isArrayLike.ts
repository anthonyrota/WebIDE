export function isArrayLike(value: any): value is ArrayLike<unknown> {
  return (
    value != null &&
    typeof value.length === 'number' &&
    typeof value !== 'function'
  )
}
