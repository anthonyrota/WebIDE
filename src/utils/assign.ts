function assignPolyfill<T>(target: T): T
function assignPolyfill<T, U>(target: T, source1: U): T & U
function assignPolyfill<T, U, V>(target: T, source1: U, source2: V): T & U & V
function assignPolyfill<T, U, V, W>(
  target: T,
  source1: U,
  source2: V,
  source3: W
): T & U & V & W
function assignPolyfill(target: object, ...sources: any[]): any
function assignPolyfill(target: object, ...sources: any[]): any {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object')
  }

  const combined = Object(target)

  for (let index = 1; index < sources.length; index++) {
    const nextSource = sources[index]

    if (nextSource != null) {
      for (const nextKey in nextSource) {
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          combined[nextKey] = nextSource[nextKey]
        }
      }
    }
  }

  return combined
}

export const assign = Object.assign || assignPolyfill
