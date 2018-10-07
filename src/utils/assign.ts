import { toObject } from './toObject'

export function assign<T>(target: T): T
export function assign<T, U>(target: T, source1: U): T & U
export function assign<T, U, V>(target: T, source1: U, source2: V): T & U & V
export function assign<T, U, V, W>(
  target: T,
  source1: U,
  source2: V,
  source3: W
): T & U & V & W
export function assign<T>(target: {}, ...sources: any): T
export function assign<T>(target: {}, ...sources: any): T {
  const combined = toObject(target) as T

  for (let i = 0; i < sources.length; i++) {
    const value = sources[i]

    if (value != null) {
      const source = Object(value)

      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          combined[key] = source[key]
        }
      }

      if (Object.getOwnPropertySymbols) {
        const symbols = Object.getOwnPropertySymbols(source)

        for (let i = 0; i < symbols.length; i++) {
          const symbol = symbols[i]

          if (Object.prototype.propertyIsEnumerable.call(source, symbol)) {
            combined[symbol] = source[symbol]
          }
        }
      }
    }
  }

  return combined
}
