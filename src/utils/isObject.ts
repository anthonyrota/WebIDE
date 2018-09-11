export function isObject(candidate: unknown): candidate is object {
  return candidate === Object(candidate)
}
