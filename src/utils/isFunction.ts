export function isFunction(value: any): value is Function {
  return (
    typeof value === 'function' ||
    Object.prototype.toString.call(value) === '[object Function]'
  )
}
