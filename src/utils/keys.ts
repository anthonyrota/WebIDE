const hasDontEnumBug = !{ toString: null }.propertyIsEnumerable('toString')
const dontEnums = [
  'toString',
  'toLocaleString',
  'valueOf',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'constructor'
]
const dontEnumsLength = dontEnums.length

function keysPolyfill(object: {}): string[] {
  if (
    object === null ||
    (typeof object !== 'function' && typeof object !== 'object')
  ) {
    throw new TypeError('Object.keys called on non-object')
  }

  const keys: string[] = []

  for (const property in object) {
    if (Object.prototype.hasOwnProperty.call(object, property)) {
      keys.push(property)
    }
  }

  if (hasDontEnumBug) {
    for (let i = 0; i < dontEnumsLength; i++) {
      if (Object.prototype.hasOwnProperty.call(object, dontEnums[i])) {
        keys.push(dontEnums[i])
      }
    }
  }

  return keys
}

export const keys = Object.keys || keysPolyfill
