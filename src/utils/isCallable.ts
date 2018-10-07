export function isCallable(value: unknown): value is Function {
  return (
    typeof value === 'function' ||
    Object.prototype.toString.call(value) === '[object Function]'
  )
}
