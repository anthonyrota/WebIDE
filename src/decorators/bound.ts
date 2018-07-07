export function bound<T extends Function>(
  target: object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> | void {
  if (!descriptor || typeof descriptor.value !== 'function') {
    throw new TypeError(
      `Only methods can be decorated with @bind. <${propertyKey}> is not a method`
    )
  }

  const { value } = descriptor

  return {
    configurable: true,
    get(this: T): T {
      const bound: T = value.bind(this)
      Object.defineProperty(this, propertyKey, {
        configurable: true,
        value: bound,
        writable: true
      })
      return bound
    }
  }
}

export default bound
