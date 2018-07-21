export function isArrayLike<T>(value: any): value is ArrayLike<T> {
  return (
    !!value && typeof value.length === 'number' && typeof value !== 'function'
  )
}
