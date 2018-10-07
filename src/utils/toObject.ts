export function toObject(val: unknown): Object {
  if (val === null || val === undefined) {
    throw new TypeError('null or undefined cannot be converted to an object')
  }

  return Object(val)
}
